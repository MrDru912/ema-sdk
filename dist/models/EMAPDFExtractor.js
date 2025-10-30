"use strict";
// src/extractors/ema-pdf-extractor.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAPDFExtractor = void 0;
const axios_1 = __importDefault(require("axios"));
const mistralai_1 = require("@mistralai/mistralai");
/**
 * PDF Extractor for EMA documents
 * Uses pdf-parse for Node.js compatibility
 */
class EMAPDFExtractor {
    constructor(mistral_api_key) {
        if (mistral_api_key !== undefined) {
            this.mistralClient = new mistralai_1.Mistral({ apiKey: mistral_api_key });
        }
    }
    /**
     * Normalize product name for URL
     */
    normalizeProductName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    /**
     * Get EMA PDF URL
     */
    getPDFUrl(productName) {
        const normalized = this.normalizeProductName(productName);
        return `https://www.ema.europa.eu/en/documents/product-information/${normalized}-epar-product-information_en.pdf`;
    }
    /**
     * Download PDF
     */
    async downloadPDF(url) {
        try {
            const response = await axios_1.default.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to download PDF: ${error.message}`);
            }
            throw error;
        }
    }
    async getMdOfEMADocByURL(pdf_url) {
        if (this.mistralClient !== undefined) {
            const ocrResponse = await this.mistralClient.ocr.process({
                model: "mistral-ocr-latest",
                document: {
                    type: "document_url",
                    documentUrl: pdf_url
                },
                includeImageBase64: false
            });
            if (!ocrResponse || !ocrResponse.pages || ocrResponse.pages.length === 0) {
                console.error(`Failed to process document with OCR for url ${pdf_url}`);
                return null;
            }
            // Merge all pages into a single markdown document
            const mergedMarkdown = ocrResponse.pages
                .sort((a, b) => a.index - b.index)
                .map((page) => page.markdown)
                .join('\n\n');
            const preprocessedMarkdown = mergedMarkdown
                .replace(/\r\n/g, '\n') // normalize line endings
                .replace(/[ \t]+\n/g, '\n') // trim trailing spaces
                .replace(/\n{3,}/g, '\n\n'); // collapse extra newlines
            const cleanedMarkdown = preprocessedMarkdown.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ');
            console.log(cleanedMarkdown.substring(0, 20));
            return cleanedMarkdown;
        }
        else
            return "";
    }
}
exports.EMAPDFExtractor = EMAPDFExtractor;
//# sourceMappingURL=EMAPDFExtractor.js.map