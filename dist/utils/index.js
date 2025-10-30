"use strict";
/**
 * Utility functions for the SUKL SDK
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = normalizeText;
exports.formatResponse = formatResponse;
__exportStar(require("./text"), exports);
__exportStar(require("./format"), exports);
/**
 * Normalize text by removing accents and special characters
 * @param text Text to normalize
 */
function normalizeText(text) {
    if (!text)
        return '';
    // Convert to lowercase and normalize
    const lowercaseText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    // Check if the text might be a registration number (contains digits and is short)
    const mightBeRegNumber = /\d/.test(lowercaseText) && text.length < 20;
    if (mightBeRegNumber) {
        // For potential registration numbers, preserve digits, slashes, and dashes
        return lowercaseText.replace(/[^a-z0-9\/\-\s]/g, '');
    }
    else {
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
function formatResponse(title, data, maxItems = 2) {
    let output = `=== ${title} ===\n`;
    if (Array.isArray(data)) {
        const items = data.slice(0, maxItems);
        output += JSON.stringify(items, null, 2);
        if (data.length > maxItems) {
            output += `\n... and ${data.length - maxItems} more items`;
        }
    }
    else {
        output += JSON.stringify(data, null, 2);
    }
    return output;
}
//# sourceMappingURL=index.js.map