/**
 * PDF Extractor for EMA documents
 * Uses pdf-parse for Node.js compatibility
 */
export declare class EMAPDFExtractor {
    private mistralClient;
    constructor(mistral_api_key: string | undefined);
    /**
     * Download PDF
     */
    downloadPDF(url: string): Promise<Buffer>;
    getMdOfEMADocByURL(pdf_url: string): Promise<string | null>;
}
//# sourceMappingURL=EMAPDFExtractor.d.ts.map