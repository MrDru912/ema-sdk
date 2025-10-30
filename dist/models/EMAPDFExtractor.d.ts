/**
 * PDF Extractor for EMA documents
 * Uses pdf-parse for Node.js compatibility
 */
export declare class EMAPDFExtractor {
    private mistralClient;
    constructor(mistral_api_key: string | undefined);
    /**
     * Normalize product name for URL
     */
    private normalizeProductName;
    /**
     * Get EMA PDF URL
     */
    getPDFUrl(productName: string): string;
    /**
     * Download PDF
     */
    downloadPDF(url: string): Promise<Buffer>;
    getMdOfEMADocByURL(pdf_url: string): Promise<string | null>;
}
//# sourceMappingURL=EMAPDFExtractor.d.ts.map