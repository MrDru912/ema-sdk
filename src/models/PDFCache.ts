import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

/**
 * PDF Cache Entry - stores extracted PDF data
 * This is the LARGE cache entry with all extracted content
 */
export interface PDFCacheEntry {
  medicineId: string;
  medicineName: string;
  
  // Extracted data from PDF
  extractedData: {
    // Basic product info
    pharmaceuticalForm?: string;
    strength?: string;
    routeOfAdministration?: string[];
    packagingInfo?: string;
    
    // Rich sections from PDF
    therapeuticIndications?: string;
    posologyAndAdministration?: string;
    contraindications?: string;
    specialWarnings?: string;
    interactions?: string;
    adverseReactions?: string;
    overdose?: string;
    pharmacologicalProperties?: string;
    pharmacokinetics?: string;
  };
  
  // Metadata
  etag?: string;
  fetchedAt: string;
  pdfUrl?: string;
  accessCount: number;
}

/**
 * PDF Cache - persistent cache for extracted PDF data
 * Stores to disk so it survives app restarts
 */
export class PDFCache {
  private cache: Map<string, PDFCacheEntry> = new Map();
  private maxEntries: number;
  private cachePath: string;

  constructor(maxEntries: number = 1000, cachePath: string = 'cache/ema-pdf-cache.json') {
    this.maxEntries = maxEntries;
    this.cachePath = cachePath;
    this.ensureCacheDir();
    this.load();
  }

  private ensureCacheDir(): void {
    const dir = this.cachePath.split('/').slice(0, -1).join('/');
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Get cached PDF data
   */
  get(medicineId: string): PDFCacheEntry | null {
    const entry = this.cache.get(medicineId);
    if (entry) {
      entry.accessCount++;
      this.save(); // Update access count
      return entry;
    }
    return null;
  }

  /**
   * Set/cache PDF data
   */
  set(medicineId: string, entry: Omit<PDFCacheEntry, 'accessCount'>): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxEntries && !this.cache.has(medicineId)) {
      this.evictLeastUsed();
    }
    
    // Add or update entry
    this.cache.set(medicineId, {
      ...entry,
      accessCount: this.cache.get(medicineId)?.accessCount || 1
    });
    
    this.save();
  }

  /**
   * Check if cache has entry
   */
  has(medicineId: string): boolean {
    return this.cache.has(medicineId);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.save();
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let minCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      console.log(`🗑️ Evicting least-used PDF cache entry: ${leastUsedKey} (accessed ${minCount} times)`);
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Load cache from disk
   */
  private load(): void {
    if (existsSync(this.cachePath)) {
      try {
        const data = JSON.parse(readFileSync(this.cachePath, 'utf-8'));
        this.cache = new Map(Object.entries(data));
        console.log(`📦 Loaded ${this.cache.size} cached PDF extractions from disk`);
      } catch (error) {
        console.error('❌ Error loading PDF cache:', error);
      }
    }
  }

  /**
   * Save cache to disk
   */
  private save(): void {
    try {
      const data = Object.fromEntries(this.cache);
      writeFileSync(this.cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error saving PDF cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const size = JSON.stringify(Object.fromEntries(this.cache)).length;
    const topUsed = Array.from(this.cache.entries())
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 10)
      .map(([id, entry]) => ({ 
        id, 
        name: entry.medicineName, 
        accessCount: entry.accessCount 
      }));

    return {
      totalEntries: this.cache.size,
      maxEntries: this.maxEntries,
      sizeInMB: (size / 1024 / 1024).toFixed(2),
      utilizationPercent: ((this.cache.size / this.maxEntries) * 100).toFixed(1),
      topUsedMedicines: topUsed
    };
  }
}