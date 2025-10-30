"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMA = void 0;
const ema_medicine_mapper_1 = require("./models/ema-medicine-mapper");
const EMAPDFExtractor_1 = require("./models/EMAPDFExtractor");
const PDFCache_1 = require("./models/PDFCache");
const utils_1 = require("./utils");
const EMAPDFParser_1 = require("./models/EMAPDFParser");
const promises_1 = require("fs/promises");
/**
 * Main EMA SDK class that provides a unified interface to all functionality
 * Similar to SUKL class but for EMA Article 57 data
 */
class EMA {
    /**
     * Create a new EMA SDK instance
     * @param options Configuration options
     */
    constructor(options = {}) {
        this.initialized = false;
        this.initializationPromise = null;
        // Cache for basic responses (not PDF data)
        this.cache = new Map();
        this.defaultCacheTTL = 24 * 60 * 60 * 1000; // 24 hours
        this.pdfParser = new EMAPDFParser_1.EMAPDFParser();
        this.medicineMapper = new ema_medicine_mapper_1.EMAMedicineMapper(options._dataPath || 'assets/ema-report.csv', options.autoUpdateData !== false);
        this.mistralApiKey = options.mistralApiKey;
        // Initialize PDF extractor and cache
        if (!this.mistralApiKey) {
            console.warn('MISTRAL_API_KEY not found in environment variables. OCR functionality will not work.');
        }
        this.pdfExtractor = new EMAPDFExtractor_1.EMAPDFExtractor(this.mistralApiKey);
        this.pdfCache = new PDFCache_1.PDFCache(options.maxPDFCache || 1000, options.pdfCachePath || 'cache/ema-pdf-cache.json');
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
    async initialize() {
        if (this.initialized)
            return true;
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
        }
        catch (error) {
            console.error('Error initializing EMA SDK:', error);
            return false;
        }
        finally {
            // Clear the initialization promise
            this.initializationPromise = null;
        }
    }
    /**
     * Check if the SDK is initialized
     * @private
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Ensure the SDK is initialized before performing operations
     * @private
     */
    async ensureInitialized() {
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
    async getFromCacheOrFetch(cacheKey, fetchFn, ttl = this.defaultCacheTTL) {
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
    clearCache() {
        this.cache.clear();
        this.pdfCache.clear();
    }
    /**
     * Clear only the PDF cache
     */
    clearPDFCache() {
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
    async listMedicines(page = 1, pageSize = 20, query, threshold = 70) {
        await this.ensureInitialized();
        // For empty queries, cache by page and pageSize
        if (!query) {
            const cacheKey = `listMedicines:${page}:${pageSize}`;
            return this.getFromCacheOrFetch(cacheKey, () => this.medicineMapper.getPaginatedMedicines(page, pageSize, query, threshold));
        }
        // For queries, cache with query and threshold
        const cacheKey = `listMedicines:${page}:${pageSize}:${query}:${threshold}`;
        return this.getFromCacheOrFetch(cacheKey, () => this.medicineMapper.getPaginatedMedicines(page, pageSize, query, threshold));
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
    async getMedicineDetails(medicineId, forceRefresh = false) {
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
                };
            }
            console.log(`❌ PDF cache MISS - will extract extended info from PDF`);
        }
        else {
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
                    await (0, promises_1.writeFile)("test.md", mdDocument, "utf8");
                    console.log("✅ File written successfully!");
                }
                else
                    console.log("mdDocument is null");
            }
            catch (err) {
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
            const completeDetails = {
                ...basicInfo, // All CSV fields (name, active_substance, route, country, etc.)
                ...extractedSections, // Extended info from PDF (indications, contraindications, etc.)
                _cached: false,
                _pdfUrl: pdfUrl,
                _lastExtracted: new Date().toISOString()
            };
            console.log(`✅ Complete! Extended data extracted and cached.`);
            return completeDetails;
        }
        catch (error) {
            console.error(`❌ Error extracting PDF for ${medicineId}:`, error);
            console.log(`⚠️ Returning basic CSV data only (PDF extraction failed)`);
            // Fallback: return basic CSV info only (no extended info)
            return {
                ...basicInfo,
                _cached: false,
                _extractionFailed: true
            };
        }
    }
    /**
     * Get medicines by country
     * @param country Country name or code
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     */
    async getMedicinesByCountry(country, page = 1, pageSize = 20) {
        await this.ensureInitialized();
        const cacheKey = `medicinesByCountry:${country}:${page}:${pageSize}`;
        return this.getFromCacheOrFetch(cacheKey, () => this.medicineMapper.getMedicinesByCountry(country, page, pageSize));
    }
    /**
     * Preload PDF data for commonly used medicines
     * Call this on app startup in background to warm up the cache
     * @param medicineIds Array of medicine IDs to preload
     * @param onProgress Optional callback for progress updates
     */
    async preloadCommonMedicines(medicineIds, onProgress) {
        await this.ensureInitialized();
        console.log(`\n🔄 Preloading ${medicineIds.length} common medicines...`);
        for (let i = 0; i < medicineIds.length; i++) {
            try {
                await this.getMedicineDetails(medicineIds[i]);
                if (onProgress) {
                    onProgress(i + 1, medicineIds.length, medicineIds[i]);
                }
                else if ((i + 1) % 10 === 0) {
                    console.log(`Progress: ${i + 1}/${medicineIds.length}`);
                }
            }
            catch (error) {
                console.error(`Error preloading ${medicineIds[i]}:`, error);
            }
        }
        console.log(`✅ Preloading complete!\n`);
    }
    /**
     * Get PDF URL for a medicine (without downloading)
     * @param medicineName Medicine name
     */
    getPDFUrlByName(medicineName) {
        return this.pdfExtractor.getPDFUrl(medicineName);
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
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
    async forceDataUpdate() {
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
    setUpdateCheckInterval(days) {
        this.medicineMapper.setUpdateCheckInterval(days);
    }
    /**
     * Normalize text by removing accents and special characters
     * @param text Text to normalize
     * @private
     */
    normalizeText(text) {
        return (0, utils_1.normalizeText)(text);
    }
}
exports.EMA = EMA;
// Create and export a default instance
const defaultInstance = new EMA();
exports.default = defaultInstance;
//# sourceMappingURL=index.js.map