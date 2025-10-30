import { EMAMedicineDetails } from '../types';
export interface EMAMedicineSearchResult {
    name: string;
    id: string;
    score: number;
    data: EMAMedicineDetails;
}
export interface PaginatedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
export declare class EMAMedicineMapper {
    private csvPath;
    private autoUpdate;
    private medicineMap;
    private nameToIdsMap;
    private loaded;
    private lastCheckedUpdate;
    private updateCheckIntervalDays;
    private normalizedNameIndex;
    private normalizedSubstanceIndex;
    private countryIndex;
    constructor(csvPath?: string, autoUpdate?: boolean);
    /**
     * Check if data file exists and is up-to-date
     */
    private isDataUpToDate;
    /**
     * Ensure data is loaded and up-to-date
     */
    ensureDataLoaded(): Promise<boolean>;
    /**
     * Parse CSV line handling quoted fields
     */
    private parseCSVLine;
    /**
     * Load medicine data from CSV
     */
    loadMap(): boolean;
    /**
     * Get paginated medicines with optional search
     * Similar to SÚKL's getPaginatedDrugs()
     */
    getPaginatedMedicines(page?: number, pageSize?: number, query?: string, threshold?: number): Promise<PaginatedResult<EMAMedicineSearchResult>>;
    /**
     * Get medicine details by ID
     */
    getMedicineDetails(id: string): Promise<EMAMedicineDetails | null>;
    /**
     * Search medicines by country
     */
    getMedicinesByCountry(country: string, page?: number, pageSize?: number): Promise<PaginatedResult<EMAMedicineSearchResult>>;
    /**
     * Set update check interval
     */
    setUpdateCheckInterval(days: number): void;
    /**
     * Force data update
     */
    forceUpdate(): Promise<boolean>;
}
//# sourceMappingURL=ema-medicine-mapper.d.ts.map