/**
 * Utility functions for the SUKL SDK
 */
export * from './text';
export * from './format';
/**
 * Normalize text by removing accents and special characters
 * @param text Text to normalize
 */
export declare function normalizeText(text: string): string;
/**
 * Format response data for console output
 * @param title Title for the output
 * @param data Data to format
 * @param maxItems Maximum number of items to show (for arrays)
 */
export declare function formatResponse(title: string, data: any, maxItems?: number): string;
//# sourceMappingURL=index.d.ts.map