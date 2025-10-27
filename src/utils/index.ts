/**
 * Utility functions for the SUKL SDK
 */

export * from './text';
export * from './format';

/**
 * Normalize text by removing accents and special characters
 * @param text Text to normalize
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  // Convert to lowercase and normalize
  const lowercaseText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  
  // Check if the text might be a registration number (contains digits and is short)
  const mightBeRegNumber = /\d/.test(lowercaseText) && text.length < 20;
  
  if (mightBeRegNumber) {
    // For potential registration numbers, preserve digits, slashes, and dashes
    return lowercaseText.replace(/[^a-z0-9\/\-\s]/g, '');
  } else {
    // For other text, remove special characters
    return lowercaseText.replace(/[^\w\s]/g, '');
  }
}

/**
 * Format response data for console output
 * @param title Title for the output
 * @param data Data to format
 * @param maxItems Maximum number of items to show (for arrays)
 */
export function formatResponse(title: string, data: any, maxItems: number = 2): string {
  let output = `=== ${title} ===\n`;
  
  if (Array.isArray(data)) {
    const items = data.slice(0, maxItems);
    output += JSON.stringify(items, null, 2);
    
    if (data.length > maxItems) {
      output += `\n... and ${data.length - maxItems} more items`;
    }
  } else {
    output += JSON.stringify(data, null, 2);
  }
  
  return output;
} 