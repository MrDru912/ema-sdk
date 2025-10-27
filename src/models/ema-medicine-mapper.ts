import { readFileSync, existsSync } from 'fs';
import { token_sort_ratio } from 'fuzzball';
import { normalizeText } from '../utils';
import { updateEMAData, checkForUpdates } from './ema-data-updater';
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

export class EMAMedicineMapper {
  private medicineMap: Map<string, EMAMedicineDetails> = new Map();
  private nameToIdsMap: Map<string, string[]> = new Map();
  private loaded: boolean = false;
  private lastCheckedUpdate: Date | null = null;
  private updateCheckIntervalDays: number = 7;
  
  // Search indexes
  private normalizedNameIndex: Map<string, Set<string>> = new Map();
  private normalizedSubstanceIndex: Map<string, Set<string>> = new Map();
  private countryIndex: Map<string, Set<string>> = new Map();

  constructor(
    private csvPath: string = 'assets/medicines_output_medicines_en.csv',
    private autoUpdate: boolean = true
  ) {}

  /**
   * Check if data file exists and is up-to-date
   */
  private async isDataUpToDate(): Promise<boolean> {
    if (!existsSync(this.csvPath)) {
      console.log('EMA CSV does not exist, will download');
      return false;
    }

    if (this.lastCheckedUpdate) {
      const now = new Date();
      const daysSinceLastCheck = (now.getTime() - this.lastCheckedUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastCheck < this.updateCheckIntervalDays) {
        return true;
      }
    }

    console.log('Checking if EMA data needs update...');
    this.lastCheckedUpdate = new Date();
    
    try {
      const hasNewData = await checkForUpdates(this.csvPath);
      
      if (hasNewData) {
        console.log('New EMA data available');
        return false;
      } else {
        console.log('EMA data is up-to-date');
        return true;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      return existsSync(this.csvPath);
    }
  }

  /**
   * Ensure data is loaded and up-to-date
   */
  async ensureDataLoaded(): Promise<boolean> {
    if (this.loaded) {
      return true;
    }

    if (this.autoUpdate && !(await this.isDataUpToDate())) {
      const updated = await updateEMAData(this.csvPath);
      if (!updated) {
        console.error('Failed to update EMA data');
        if (!existsSync(this.csvPath)) {
          return false;
        }
      }
    }

    return this.loadMap();
  }

  /**
   * Parse CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(s => s.replace(/^"|"$/g, ''));
  }

  /**
   * Load medicine data from CSV
   */
  loadMap(): boolean {
    try {
      console.log('Loading EMA report data...');
      const data = readFileSync(this.csvPath, 'utf8');
      const lines = data.split('\n');
      
      if (lines.length === 0) {
        console.error('CSV file is empty');
        return false;
      }
      
      // Parse header
      const headers = this.parseCSVLine(lines[0]);
      console.log('CSV Headers:', headers);
      
      // Clear indexes
      this.medicineMap.clear();
      this.nameToIdsMap.clear();
      this.normalizedNameIndex.clear();
      this.normalizedSubstanceIndex.clear();
      this.countryIndex.clear();
      
      // Process data rows
      let processedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = this.parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        // Create medicine details object
        const details: any = {};
        
        headers.forEach((header, idx) => {
          const value = values[idx]?.trim();
          if (header) {
            // Normalize header to snake_case
        const key = header.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '_')  // Replace with underscore
          .replace(/_+/g, '_')           // Collapse multiple underscores
          .replace(/^_|_$/g, '');        // Remove leading/trailing
                    details[key] = value || '';
                  }
                });

                if (i === 1) {
          console.log('\nFirst row field names:', Object.keys(details));
          console.log('First row values sample:');
          Object.keys(details).slice(0, 10).forEach(key => {
            console.log(`  ${key}: "${details[key]}"`);
          });
        }

        
        // Get product name
        const productName = details.name_of_medicine || details.product_name || details.product_short_name || details.name || '';
        if (!productName) continue;
        
        // Create unique ID from product name + country + MAH
        const normalizedName = normalizeText(productName);
        const country = details.country || details.country_of_authorisation || '';
        const mah = details.marketing_authorisation_holder || details.mah || '';
        const id = `${normalizedName}_${normalizeText(country)}_${normalizeText(mah)}`.substring(0, 100);
        
        // Store medicine
        this.medicineMap.set(id, details as EMAMedicineDetails);
        
        // Index by name
        if (!this.nameToIdsMap.has(normalizedName)) {
          this.nameToIdsMap.set(normalizedName, []);
        }
        this.nameToIdsMap.get(normalizedName)?.push(id);
        
        // Index name words
        const nameWords = normalizedName.split(/\s+/);
        for (const word of nameWords) {
          if (word.length < 2) continue;
          
          if (!this.normalizedNameIndex.has(word)) {
            this.normalizedNameIndex.set(word, new Set());
          }
          this.normalizedNameIndex.get(word)?.add(id);
        }
        
        // Index active substance
        const activeSubstance = details.active_substance || '';
        if (activeSubstance) {
          const normalizedSubstance = normalizeText(activeSubstance);
          const substanceWords = normalizedSubstance.split(/\s+/);
          
          for (const word of substanceWords) {
            if (word.length < 2) continue;
            
            if (!this.normalizedSubstanceIndex.has(word)) {
              this.normalizedSubstanceIndex.set(word, new Set());
            }
            this.normalizedSubstanceIndex.get(word)?.add(id);
          }
        }
        
        // Index by country
        if (country) {
          const normalizedCountry = normalizeText(country);
          if (!this.countryIndex.has(normalizedCountry)) {
            this.countryIndex.set(normalizedCountry, new Set());
          }
          this.countryIndex.get(normalizedCountry)?.add(id);
        }
        
        processedCount++;
      }

      this.loaded = true;
      console.log(`Loaded ${this.medicineMap.size} EMA medicines (${processedCount} processed)`);
      return true;
    } catch (error) {
      console.error('Error loading EMA data:', error);
      return false;
    }
  }

  /**
   * Get paginated medicines with optional search
   * Similar to SÚKL's getPaginatedDrugs()
   */
  async getPaginatedMedicines(
    page: number = 1,
    pageSize: number = 20,
    query?: string,
    threshold: number = 70
  ): Promise<PaginatedResult<EMAMedicineSearchResult>> {
    await this.ensureDataLoaded();

    page = Math.max(1, page);
    pageSize = Math.max(1, Math.min(100, pageSize));

    let filtered: Array<[string, EMAMedicineDetails, number]> = [];

    if (query && query.trim()) {
      const normalizedQuery = normalizeText(query.trim());
      const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length >= 2);
      
      const matchedIds = new Set<string>();
      const matchScores = new Map<string, number>();
      
      // Exact name match
      if (this.nameToIdsMap.has(normalizedQuery)) {
        const exactIds = this.nameToIdsMap.get(normalizedQuery) || [];
        for (const id of exactIds) {
          matchedIds.add(id);
          matchScores.set(id, 100);
        }
      }
      
      // Search by name words
      if (queryWords.length > 0) {
        const wordMatches = new Map<string, Set<string>>();
        
        for (const word of queryWords) {
          for (const [indexWord, ids] of this.normalizedNameIndex.entries()) {
            if (indexWord.includes(word)) {
              if (!wordMatches.has(word)) {
                wordMatches.set(word, new Set());
              }
              for (const id of ids) {
                wordMatches.get(word)?.add(id);
              }
            }
          }
        }
        
        // Medicines matching all words
        if (wordMatches.size === queryWords.length) {
          const allWordMatches = Array.from(wordMatches.values());
          if (allWordMatches.length > 0) {
            const intersection = new Set(allWordMatches[0]);
            for (let i = 1; i < allWordMatches.length; i++) {
              for (const id of intersection) {
                if (!allWordMatches[i].has(id)) {
                  intersection.delete(id);
                }
              }
            }
            
            for (const id of intersection) {
              matchedIds.add(id);
              if (!matchScores.has(id) || matchScores.get(id)! < 98) {
                matchScores.set(id, 98);
              }
            }
          }
        }
        
        // Medicines matching any word
        for (const ids of wordMatches.values()) {
          for (const id of ids) {
            if (!matchScores.has(id)) {
              matchedIds.add(id);
              matchScores.set(id, 80);
            }
          }
        }
      }
      
      // Search by substance
      if (queryWords.length > 0) {
        for (const word of queryWords) {
          for (const [indexWord, ids] of this.normalizedSubstanceIndex.entries()) {
            if (indexWord.includes(word)) {
              for (const id of ids) {
                matchedIds.add(id);
                if (!matchScores.has(id) || matchScores.get(id)! < 75) {
                  matchScores.set(id, 75);
                }
              }
            }
          }
        }
      }
      
      // Fuzzy matching
      if (matchedIds.size < pageSize * 2) {
        for (const [id, details] of this.medicineMap.entries()) {
          if (matchedIds.has(id)) continue;
          
          const name = details.name_of_medicine || details.product_name || '';
          const fuzzyScore = token_sort_ratio(normalizedQuery, normalizeText(name));
          if (fuzzyScore >= threshold) {
            matchedIds.add(id);
            if (!matchScores.has(id) || matchScores.get(id)! < fuzzyScore) {
              matchScores.set(id, fuzzyScore);
            }
          }
        }
      }
      
      // Create filtered list
      for (const id of matchedIds) {
        const details = this.medicineMap.get(id);
        if (details) {
          filtered.push([id, details, matchScores.get(id) || 0]);
        }
      }
      
      filtered.sort((a, b) => b[2] - a[2]);
      
    } else {
      // No query - return all sorted alphabetically
      const allMedicines = Array.from(this.medicineMap.entries());
      allMedicines.sort((a, b) => {
        const nameA = a[1].name_of_medicine || a[1].product_name || '';
        const nameB = b[1].name_of_medicine || b[1].product_name || '';
        return nameA.localeCompare(nameB);
      });
      filtered = allMedicines.map(([id, details]) => [id, details, 0]);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    if (startIndex >= totalItems) {
      return {
        items: [],
        page,
        pageSize,
        totalItems,
        totalPages
      };
    }

    const pageItems = filtered.slice(startIndex, endIndex);
    
    const items: EMAMedicineSearchResult[] = pageItems.map(([id, details, score]) => ({
      name: details.name_of_medicine || details.product_name || details.product_short_name || details.name || '',
      id,
      score,
      data: details
    }));

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages
    };
  }

  /**
   * Get medicine details by ID
   */
  async getMedicineDetails(id: string): Promise<EMAMedicineDetails | null> {
    await this.ensureDataLoaded();
    return this.medicineMap.get(id) || null;
  }

  /**
   * Search medicines by country
   */
  async getMedicinesByCountry(country: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<EMAMedicineSearchResult>> {
    await this.ensureDataLoaded();
    
    const normalizedCountry = normalizeText(country);
    const ids = this.countryIndex.get(normalizedCountry) || new Set();
    
    const medicines: Array<[string, EMAMedicineDetails]> = [];
    for (const id of ids) {
      const details = this.medicineMap.get(id);
      if (details) {
        medicines.push([id, details]);
      }
    }
    
    // Sort alphabetically
    medicines.sort((a, b) => (a[1].product_name || '').localeCompare(b[1].product_name || ''));
    
    const totalItems = medicines.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    const pageItems = medicines.slice(startIndex, endIndex);
    const items: EMAMedicineSearchResult[] = pageItems.map(([id, details]) => ({
      name: details.name_of_medicine || details.product_name || details.product_short_name || details.name || '',
      id,
      score: 0,
      data: details
    }));

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages
    };
  }

  /**
   * Set update check interval
   */
  setUpdateCheckInterval(days: number): void {
    this.updateCheckIntervalDays = Math.max(1, days);
  }

  /**
   * Force data update
   */
  async forceUpdate(): Promise<boolean> {
    const success = await updateEMAData(this.csvPath);
    
    if (success) {
      this.loaded = false;
      this.medicineMap.clear();
      this.nameToIdsMap.clear();
      this.normalizedNameIndex.clear();
      this.normalizedSubstanceIndex.clear();
      this.countryIndex.clear();
      this.lastCheckedUpdate = new Date();
    }
    
    return success;
  }
}