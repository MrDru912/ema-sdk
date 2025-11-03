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
    private getProductNameFromURL;
    /**
     * Get EMA product information PDF URL by medicine url
     */
    getPDFUrl(medicine_url: string): string;
    /**
     * Download PDF
     */
    downloadPDF(url: string): Promise<Buffer>;
    getMdOfEMADocByURL(pdf_url: string): Promise<string | null>;
}
//# sourceMappingURL=EMAPDFExtractor.d.ts.map