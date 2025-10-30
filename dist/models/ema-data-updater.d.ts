/**
 * Check if there's a new Article 57 file available
 */
export declare function checkForUpdates(targetCsvPath?: string): Promise<boolean>;
/**
 * Download and convert Article 57 Excel to CSV
 */
export declare function updateEMAData(targetCsvPath?: string): Promise<boolean>;
declare const _default: {
    updateEMAData: typeof updateEMAData;
    checkForUpdates: typeof checkForUpdates;
};
export default _default;
//# sourceMappingURL=ema-data-updater.d.ts.map