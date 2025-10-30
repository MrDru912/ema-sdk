/**
 * PDF Cache Entry - stores extracted PDF data
 * This is the LARGE cache entry with all extracted content
 */
export interface PDFCacheEntry {
    medicineId: string;
    medicineName: string;
    extractedData: {
        pharmaceuticalForm?: string;
        strength?: string;
        routeOfAdministration?: string[];
        packagingInfo?: string;
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
    etag?: string;
    fetchedAt: string;
    pdfUrl?: string;
    accessCount: number;
}
/**
 * PDF Cache - persistent cache for extracted PDF data
 * Stores to disk so it survives app restarts
 */
export declare class PDFCache {
    private cache;
    private maxEntries;
    private cachePath;
    constructor(maxEntries?: number, cachePath?: string);
    private ensureCacheDir;
    /**
     * Get cached PDF data
     */
    get(medicineId: string): PDFCacheEntry | null;
    /**
     * Set/cache PDF data
     */
    set(medicineId: string, entry: Omit<PDFCacheEntry, 'accessCount'>): void;
    /**
     * Check if cache has entry
     */
    has(medicineId: string): boolean;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Evict least recently used entry
     */
    private evictLeastUsed;
    /**
     * Load cache from disk
     */
    private load;
    /**
     * Save cache to disk
     */
    private save;
    /**
     * Get cache statistics
     */
    getStats(): {
        totalEntries: number;
        maxEntries: number;
        sizeInMB: string;
        utilizationPercent: string;
        topUsedMedicines: {
            id: string;
            name: string;
            accessCount: number;
        }[];
    };
}
//# sourceMappingURL=PDFCache.d.ts.map