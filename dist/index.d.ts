import { EMAPDFExtractor } from './models/EMAPDFExtractor';
import { EMAMedicineDetails, EMAMedicineSearchResult, PaginatedResult } from './types';
/**
 * Main EMA SDK class that provides a unified interface to all functionality
 * Similar to SUKL class but for EMA Article 57 data
 */
declare class EMA {
    private medicineMapper;
    pdfExtractor: EMAPDFExtractor;
    private pdfParser;
    private pdfCache;
    private initialized;
    private initializationPromise;
    private mistralApiKey;
    private cache;
    private defaultCacheTTL;
    /**
     * Create a new EMA SDK instance
     * @param options Configuration options
     */
    constructor(options?: {
        autoUpdateData?: boolean;
        updateCheckIntervalDays?: number;
        cacheTTL?: number;
        maxPDFCache?: number;
        pdfCachePath?: string;
        _dataPath?: string;
        mistralApiKey?: string;
    });
    /**
     * Initialize the SDK by loading the medicine data
     * This is called automatically when needed
     * @private
     */
    private initialize;
    /**
     * Check if the SDK is initialized
     * @private
     */
    private isInitialized;
    /**
     * Ensure the SDK is initialized before performing operations
     * @private
     */
    private ensureInitialized;
    /**
     * Get data from cache or fetch it if not available
     * @param cacheKey Cache key
     * @param fetchFn Function to fetch data if not in cache
     * @param ttl Time to live in milliseconds
     * @private
     */
    private getFromCacheOrFetch;
    /**
     * Clear all caches (basic cache and PDF cache)
     */
    clearCache(): void;
    /**
     * Clear only the PDF cache
     */
    clearPDFCache(): void;
    /**
     * Get a paginated list of medicines with optional search functionality
     * Searches across name, active substance, and country
     * Returns basic info only - no PDF extraction
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @param query Optional search query
     * @param threshold Minimum similarity score for fuzzy matching (0-100)
     */
    listMedicines(page?: number, pageSize?: number, query?: string, threshold?: number): Promise<PaginatedResult<EMAMedicineSearchResult>>;
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
    getMedicineDetails(medicineId: string, forceRefresh?: boolean): Promise<EMAMedicineDetails | null>;
    /**
     * Get medicines by country
     * @param country Country name or code
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     */
    getMedicinesByCountry(country: string, page?: number, pageSize?: number): Promise<PaginatedResult<EMAMedicineSearchResult>>;
    /**
     * Preload PDF data for commonly used medicines
     * Call this on app startup in background to warm up the cache
     * @param medicineIds Array of medicine IDs to preload
     * @param onProgress Optional callback for progress updates
     */
    preloadCommonMedicines(medicineIds: string[], onProgress?: (current: number, total: number, medicineId: string) => void): Promise<void>;
    /**
     * Get PDF URL for a medicine (without downloading)
     * @param medicineName Medicine name
     */
    getPDFUrlByName(medicineName: string): string;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        basicCache: {
            entries: number;
            sizeInMB: string;
            description: string;
        };
        pdfCache: {
            description: string;
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
        total: {
            entries: number;
            sizeInMB: string;
        };
    };
    /**
     * Force an update of the medicine data (CSV)
     * This is normally handled automatically, but can be called manually if needed
     * @returns Whether the update was successful
     */
    forceDataUpdate(): Promise<boolean>;
    /**
     * Set the interval for checking for updates
     * @param days Number of days between update checks
     */
    setUpdateCheckInterval(days: number): void;
    /**
     * Normalize text by removing accents and special characters
     * @param text Text to normalize
     * @private
     */
    private normalizeText;
}
export type { PaginatedResult, EMAMedicineSearchResult, EMAMedicineDetails };
export { EMA };
declare const defaultInstance: EMA;
export default defaultInstance;
//# sourceMappingURL=index.d.ts.map