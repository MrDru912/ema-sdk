/**
 * Text utility functions for the SUKL SDK
 */

/**
 * Normalize text by removing accents and special characters
 * @param text Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  if (!text) {
    return '';
  }
  
  // Convert to lowercase
  text = text.toLowerCase();
  
  // Remove accents
  text = text
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
    .replace(/ý/g, 'y').replace(/ě/g, 'e').replace(/š/g, 's').replace(/č/g, 'c').replace(/ř/g, 'r')
    .replace(/ž/g, 'z').replace(/ý/g, 'y').replace(/á/g, 'a').replace(/í/g, 'i').replace(/é/g, 'e')
    .replace(/ů/g, 'u').replace(/ň/g, 'n').replace(/ť/g, 't').replace(/ď/g, 'd');
  
  // Check if the text might be a registration number (contains digits and is short)
  const mightBeRegNumber = /\d/.test(text) && text.length < 20;
  
  if (mightBeRegNumber) {
    // For potential registration numbers, preserve digits, slashes, and dashes
    text = text.replace(/[^a-z0-9\/\-\s]/g, '');
  } else {
    // For other text, remove special characters
    text = text.replace(/[^a-z0-9\s]/g, '');
  }
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
} 