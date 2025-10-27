import PdfParse from 'pdf-parse';
import { EMAMedicineMapper } from './models/ema-medicine-mapper';
import { EMAPDFExtractor } from './models/EMAPDFExtractor';
import { PDFCache } from './models/PDFCache';
import { EMAMedicineDetails, EMAMedicineSearchResult, PaginatedResult } from './types';
import { normalizeText } from './utils';
import { EMAPDFParser } from './models/EMAPDFParser';
import { writeFile } from "fs/promises";

// Cache for basic responses (search results, etc.)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Main EMA SDK class that provides a unified interface to all functionality
 * Similar to SUKL class but for EMA Article 57 data
 */
class EMA {
  private medicineMapper: EMAMedicineMapper;
  public pdfExtractor: EMAPDFExtractor;
  private pdfParser: EMAPDFParser;
  private pdfCache: PDFCache;
  private initialized: boolean = false;
  private initializationPromise: Promise<boolean> | null = null;
  private mistralApiKey: string | undefined;

  // Cache for basic responses (not PDF data)
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultCacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create a new EMA SDK instance
   * @param options Configuration options
   */
  constructor(options: {
    autoUpdateData?: boolean;
    updateCheckIntervalDays?: number;
    cacheTTL?: number;
    maxPDFCache?: number;
    pdfCachePath?: string;
    _dataPath?: string; // Private option
    mistralApiKey?: string;
  } = {}) {
    this.pdfParser = new EMAPDFParser();
    this.medicineMapper = new EMAMedicineMapper(
      options._dataPath || 'assets/ema-report.csv',
      options.autoUpdateData !== false
    );
    this.mistralApiKey = options.mistralApiKey;
    // Initialize PDF extractor and cache
    if (!this.mistralApiKey) {
      console.warn('MISTRAL_API_KEY not found in environment variables. OCR functionality will not work.');
    }
    this.pdfExtractor = new EMAPDFExtractor(this.mistralApiKey);
    this.pdfCache = new PDFCache(
      options.maxPDFCache || 1000,
      options.pdfCachePath || 'cache/ema-pdf-cache.json'
    );
    
    // Set update check interval if provided
    if (options.updateCheckIntervalDays) {
      this.medicineMapper.setUpdateCheckInterval(options.updateCheckIntervalDays);
    }
    
    // Set cache TTL if provided
    if (options.cacheTTL) {
      this.defaultCacheTTL = options.cacheTTL;
    }
  }

  /**
   * Initialize the SDK by loading the medicine data
   * This is called automatically when needed
   * @private
   */
  private async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    // If initialization is already in progress, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // Start initialization and store the promise
    this.initializationPromise = this.medicineMapper.ensureDataLoaded();
    
    try {
      // Wait for initialization to complete
      const success = await this.initializationPromise;
      this.initialized = success;
      return success;
    } catch (error) {
      console.error('Error initializing EMA SDK:', error);
      return false;
    } finally {
      // Clear the initialization promise
      this.initializationPromise = null;
    }
  }

  /**
   * Check if the SDK is initialized
   * @private
   */
  private isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Ensure the SDK is initialized before performing operations
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized()) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize EMA SDK');
      }
    }
  }
  
  /**
   * Get data from cache or fetch it if not available
   * @param cacheKey Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param ttl Time to live in milliseconds
   * @private
   */
  private async getFromCacheOrFetch<T>(
    cacheKey: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = this.defaultCacheTTL
  ): Promise<T> {
    const now = Date.now();
    
    // Check if we have a valid cache entry
    const cacheEntry = this.cache.get(cacheKey);
    if (cacheEntry && cacheEntry.expiresAt > now) {
      return cacheEntry.data;
    }
    
    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    
    return data;
  }
  
  /**
   * Clear all caches (basic cache and PDF cache)
   */
  public clearCache(): void {
    this.cache.clear();
    this.pdfCache.clear();
  }

  /**
   * Clear only the PDF cache
   */
  public clearPDFCache(): void {
    this.pdfCache.clear();
  }

  /**
   * Get a paginated list of medicines with optional search functionality
   * Searches across name, active substance, and country
   * Returns basic info only - no PDF extraction
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @param query Optional search query
   * @param threshold Minimum similarity score for fuzzy matching (0-100)
   */
  public async listMedicines(
    page: number = 1,
    pageSize: number = 20,
    query?: string,
    threshold: number = 70
  ): Promise<PaginatedResult<EMAMedicineSearchResult>> {
    await this.ensureInitialized();
    
    // For empty queries, cache by page and pageSize
    if (!query) {
      const cacheKey = `listMedicines:${page}:${pageSize}`;
      return this.getFromCacheOrFetch(cacheKey, () => 
        this.medicineMapper.getPaginatedMedicines(page, pageSize, query, threshold)
      );
    }
    
    // For queries, cache with query and threshold
    const cacheKey = `listMedicines:${page}:${pageSize}:${query}:${threshold}`;
    return this.getFromCacheOrFetch(cacheKey, () => 
      this.medicineMapper.getPaginatedMedicines(page, pageSize, query, threshold)
    );
  }

  /**
   * Get detailed information for a specific medicine
   * 
   * Returns:
   * - Basic info from CSV (always): name, active substance, route, country, holder, etc.
   * - Extended info from PDF (lazy loaded): therapeutic indications, contraindications, 
   *   adverse reactions, posology, warnings, interactions, etc.
   * 
   * First call: Downloads & extracts PDF for extended info (slow, ~5-10 seconds)
   * Subsequent calls: Returns from cache (fast, ~1ms)
   * 
   * @param medicineId Medicine ID
   * @param forceRefresh Force refresh from PDF even if cached
   */
  public async getMedicineDetails(
    medicineId: string,
    forceRefresh: boolean = false
  ): Promise<EMAMedicineDetails | null> {
    await this.ensureInitialized();

    console.log(`\n📋 Getting details for medicine ID: ${medicineId}`);

    // 1. Get basic info from CSV (always fast)
    // This includes: name, active_substance, route, country, holder, atc_code, etc.
    const basicInfo = await this.medicineMapper.getMedicineDetails(medicineId);
    if (!basicInfo) {
      console.log(`❌ Medicine not found: ${medicineId}`);
      return null;
    }

    console.log(`✅ Basic info from CSV loaded`);

    // 2. Check PDF cache for extended information
    if (!forceRefresh) {
      const cachedPDF = this.pdfCache.get(medicineId);
      if (cachedPDF) {
        console.log(`✅ PDF cache HIT - returning cached extended data`);
        
        // Merge basic CSV info with cached PDF extended data
        return {
          ...basicInfo, // All CSV fields (basic info)
          ...cachedPDF.extractedData, // Extended info from PDF
          _cached: true,
          _pdfUrl: cachedPDF.pdfUrl,
          _lastExtracted: cachedPDF.fetchedAt
        } as EMAMedicineDetails;
      }
      console.log(`❌ PDF cache MISS - will extract extended info from PDF`);
    } else {
      console.log(`🔄 Force refresh - will extract extended info from PDF`);
    }

    // 3. Extract extended information from PDF (slow first time)
    try {
      const pdfUrl = this.pdfExtractor.getPDFUrl(basicInfo.name_of_medicine);
      console.log(`📥 Downloading PDF from: ${pdfUrl}`);
      
      // const pdfData = await this.pdfExtractor.downloadPDF(pdfUrl);
      // console.log(`📄 Extracting text from PDF...`);
            
      const mdDocument = await this.pdfExtractor.getMdOfEMADocByURL(pdfUrl);
      try {
        if (mdDocument) {
          await writeFile("test.md", mdDocument, "utf8");
          console.log("✅ File written successfully!");
        } else console.log("mdDocument is null");
      } catch (err) {
        console.error("❌ Error writing file:", err);
      }

      const extractedSections = this.pdfParser.parseFullDocument(mdDocument || "");
      
      // 4. Cache the extracted PDF extended data
      console.log(`💾 Caching extracted extended data...`);
      this.pdfCache.set(medicineId, {
        medicineId,
        medicineName: basicInfo.name_of_medicine,
        extractedData: extractedSections, // Only extended sections, NOT basic info
        fetchedAt: new Date().toISOString(),
        pdfUrl
      });
      
      // 5. Merge and return: CSV basic info + PDF extended info
      const completeDetails: EMAMedicineDetails = {
        ...basicInfo, // All CSV fields (name, active_substance, route, country, etc.)
        ...extractedSections, // Extended info from PDF (indications, contraindications, etc.)
        _cached: false,
        _pdfUrl: pdfUrl,
        _lastExtracted: new Date().toISOString()
      };
      
      console.log(`✅ Complete! Extended data extracted and cached.`);
      return completeDetails;
      
    } catch (error) {
      console.error(`❌ Error extracting PDF for ${medicineId}:`, error);
      console.log(`⚠️ Returning basic CSV data only (PDF extraction failed)`);
      
      // Fallback: return basic CSV info only (no extended info)
      return {
        ...basicInfo,
        _cached: false,
        _extractionFailed: true
      } as EMAMedicineDetails;
    }
  }

  /**
   * Get medicines by country
   * @param country Country name or code
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   */
  public async getMedicinesByCountry(
    country: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResult<EMAMedicineSearchResult>> {
    await this.ensureInitialized();
    
    const cacheKey = `medicinesByCountry:${country}:${page}:${pageSize}`;
    
    return this.getFromCacheOrFetch(cacheKey, () => 
      this.medicineMapper.getMedicinesByCountry(country, page, pageSize)
    );
  }

  /**
   * Preload PDF data for commonly used medicines
   * Call this on app startup in background to warm up the cache
   * @param medicineIds Array of medicine IDs to preload
   * @param onProgress Optional callback for progress updates
   */
  public async preloadCommonMedicines(
    medicineIds: string[],
    onProgress?: (current: number, total: number, medicineId: string) => void
  ): Promise<void> {
    await this.ensureInitialized();
    
    console.log(`\n🔄 Preloading ${medicineIds.length} common medicines...`);
    
    for (let i = 0; i < medicineIds.length; i++) {
      try {
        await this.getMedicineDetails(medicineIds[i]);
        
        if (onProgress) {
          onProgress(i + 1, medicineIds.length, medicineIds[i]);
        } else if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${medicineIds.length}`);
        }
      } catch (error) {
        console.error(`Error preloading ${medicineIds[i]}:`, error);
      }
    }
    
    console.log(`✅ Preloading complete!\n`);
  }

  /**
   * Get PDF URL for a medicine (without downloading)
   * @param medicineName Medicine name
   */
  public getPDFUrl(medicineName: string): string {
    return this.pdfExtractor.getPDFUrl(medicineName);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    const pdfCacheStats = this.pdfCache.getStats();
    const basicCacheSize = JSON.stringify(Object.fromEntries(this.cache)).length;
    
    return {
      basicCache: {
        entries: this.cache.size,
        sizeInMB: (basicCacheSize / 1024 / 1024).toFixed(2),
        description: 'Search results and lists from CSV'
      },
      pdfCache: {
        ...pdfCacheStats,
        description: 'Extended information extracted from PDFs'
      },
      total: {
        entries: this.cache.size + pdfCacheStats.totalEntries,
        sizeInMB: (basicCacheSize / 1024 / 1024 + parseFloat(pdfCacheStats.sizeInMB)).toFixed(2)
      }
    };
  }

  /**
   * Force an update of the medicine data (CSV)
   * This is normally handled automatically, but can be called manually if needed
   * @returns Whether the update was successful
   */
  public async forceDataUpdate(): Promise<boolean> {
    const success = await this.medicineMapper.forceUpdate();
    if (success) {
      this.initialized = false;
      this.clearCache(); // Clear all caches when data is updated
      await this.ensureInitialized();
    }
    return success;
  }

  /**
   * Set the interval for checking for updates
   * @param days Number of days between update checks
   */
  public setUpdateCheckInterval(days: number): void {
    this.medicineMapper.setUpdateCheckInterval(days);
  }

  /**
   * Normalize text by removing accents and special characters
   * @param text Text to normalize
   * @private
   */
  private normalizeText(text: string): string {
    return normalizeText(text);
  }
}

// Re-export types
export type {
  PaginatedResult,
  EMAMedicineSearchResult,
  EMAMedicineDetails
};

// Export the EMA class
export { EMA };

// Create and export a default instance
const defaultInstance = new EMA();
export default defaultInstance;