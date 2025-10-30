"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFCache = void 0;
const fs_1 = require("fs");
/**
 * PDF Cache - persistent cache for extracted PDF data
 * Stores to disk so it survives app restarts
 */
class PDFCache {
    constructor(maxEntries = 1000, cachePath = 'cache/ema-pdf-cache.json') {
        this.cache = new Map();
        this.maxEntries = maxEntries;
        this.cachePath = cachePath;
        this.ensureCacheDir();
        this.load();
    }
    ensureCacheDir() {
        const dir = this.cachePath.split('/').slice(0, -1).join('/');
        if (dir && !(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
    }
    /**
     * Get cached PDF data
     */
    get(medicineId) {
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
    set(medicineId, entry) {
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
    has(medicineId) {
        return this.cache.has(medicineId);
    }
    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
        this.save();
    }
    /**
     * Evict least recently used entry
     */
    evictLeastUsed() {
        let leastUsedKey = null;
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
    load() {
        if ((0, fs_1.existsSync)(this.cachePath)) {
            try {
                const data = JSON.parse((0, fs_1.readFileSync)(this.cachePath, 'utf-8'));
                this.cache = new Map(Object.entries(data));
                console.log(`📦 Loaded ${this.cache.size} cached PDF extractions from disk`);
            }
            catch (error) {
                console.error('❌ Error loading PDF cache:', error);
            }
        }
    }
    /**
     * Save cache to disk
     */
    save() {
        try {
            const data = Object.fromEntries(this.cache);
            (0, fs_1.writeFileSync)(this.cachePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
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
exports.PDFCache = PDFCache;
//# sourceMappingURL=PDFCache.js.map