"use strict";
/**
 * Formatting utility functions for the SUKL SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = formatResponse;
/**
 * Format response data for console output
 * @param title Title for the output
 * @param data Data to format
 * @param maxItems Maximum number of items to show (for arrays)
 */
function formatResponse(title, data, maxItems = 2) {
    let output = `\n${title}:\n`;
    if (Array.isArray(data)) {
        output += `Total items: ${data.length}\n`;
        data = data.slice(0, maxItems); // Show only first few items
    }
    if (typeof data === 'object') {
        output += JSON.stringify(data, null, 2);
    }
    else {
        output += data;
    }
    output += '\n' + '-'.repeat(50);
    return output;
}
//# sourceMappingURL=format.js.map