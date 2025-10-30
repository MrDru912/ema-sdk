import { ExtractedPDFData } from '../types';
/**
 * Parse EMA PDF markdown text and extract structured data
 */
export declare class EMAPDFParser {
    /**
     * Extract a section from markdown text based on heading patterns
     * @param text Full markdown text
     * @param sectionNumber Section number (e.g., "1", "2", "4.1", "4.2")
     * @param sectionTitle Section title (for matching, case-insensitive)
     * @param nextSectionNumber Next section number (to know where to stop)
     * @param nextSectionTitle Next section title (optional, for more precise matching)
     */
    private extractSection;
    /**
     * Parse the complete EMA document
     * @param mdText Markdown text from PDF
     */
    parseDocument(mdText: string): Partial<ExtractedPDFData>;
    /**
     * Full parsing pipeline
     * @param mdText Markdown text from PDF
     */
    parseFullDocument(mdText: string): ExtractedPDFData;
}
//# sourceMappingURL=EMAPDFParser.d.ts.map