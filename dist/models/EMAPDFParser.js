"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAPDFParser = void 0;
/**
 * Parse EMA PDF markdown text and extract structured data
 */
class EMAPDFParser {
    /**
     * Extract a section from markdown text based on heading patterns
     * @param text Full markdown text
     * @param sectionNumber Section number (e.g., "1", "2", "4.1", "4.2")
     * @param sectionTitle Section title (for matching, case-insensitive)
     * @param nextSectionNumber Next section number (to know where to stop)
     * @param nextSectionTitle Next section title (optional, for more precise matching)
     */
    extractSection(text, sectionNumber, nextSectionNumber, sectionTitle) {
        // Escape dots in section numbers
        const escapedSectionNumber = sectionNumber.replace(/\./g, '\\.');
        const escapedNextSectionNumber = nextSectionNumber.replace(/\./g, '\\.');
        const startPattern = new RegExp(`^#{1,6}\\s*${escapedSectionNumber}\\.?\\s+([^\\n#]+)`, 'mi');
        const endPattern = new RegExp(`^#{1,6}\\s*${escapedNextSectionNumber}\\.?\\s+([^\\n#]+)`, 'mi');
        const startMatch = startPattern.exec(text);
        const endMatch = endPattern.exec(text);
        if (startMatch && startMatch.index !== undefined) {
            const startIndex = text.indexOf('\n', startMatch.index);
            const sectionStart = startIndex !== -1 ? startIndex + 1 : startMatch.index + startMatch[0].length;
            console.log("section start: " + sectionStart);
            let sectionEnd = text.length;
            if (endMatch && endMatch.index !== undefined) {
                sectionEnd = endMatch.index;
            }
            else
                console.log("endMatch undefined, end of the section was not found " + endMatch);
            const sectionContent = text.slice(sectionStart, sectionEnd).trim();
            return sectionContent;
        }
        else
            console.log("startMatch undefined, start of the section was not found " + startMatch);
    }
    /**
     * Parse the complete EMA document
     * @param mdText Markdown text from PDF
     */
    parseDocument(mdText) {
        console.log(`📋 Parsing document (${mdText.length} characters)...`);
        const extracted = {};
        // Section 1 - Therapeutic indications
        extracted.nameOfMedicalProduct = this.extractSection(mdText, '1', '2');
        if (extracted.nameOfMedicalProduct) {
            console.log('✓ Found name of medical product');
        }
        // Section 2 - Therapeutic indications
        extracted.qualitativeAndQuantitativeComposition = this.extractSection(mdText, '2', '3');
        if (extracted.qualitativeAndQuantitativeComposition) {
            console.log('✓ Found qualitative and quantitative composition');
        }
        // Section 3 - Pharmaceutical form
        extracted.pharmaceuticalForm = this.extractSection(mdText, '3', '4');
        if (extracted.pharmaceuticalForm) {
            console.log('✓ Found pharmaceutical form');
        }
        // Section 4.2 - Posology and method of administration
        extracted.therapeuticIndications = this.extractSection(mdText, '4.1', '4.2');
        if (extracted.therapeuticIndications) {
            console.log('✓ Found therapeutic indications');
        }
        // Section 4.2 - Posology and method of administration
        extracted.posologyAndAdministration = this.extractSection(mdText, '4.2', '4.3', 'posology and method of administration');
        if (extracted.posologyAndAdministration) {
            console.log('✓ Found posology and administration');
        }
        // Section 4.3 - Contraindications
        extracted.contraindications = this.extractSection(mdText, '4.3', '4.4', 'contraindications');
        if (extracted.contraindications) {
            console.log('✓ Found contraindications');
        }
        // Section 4.4 - Special warnings and precautions for use
        extracted.specialWarnings = this.extractSection(mdText, '4.4', '4.5', 'special warnings and precautions');
        if (extracted.specialWarnings) {
            console.log('✓ Found special warnings');
        }
        // Section 4.5 - Interaction with other medicinal products
        extracted.interactions = this.extractSection(mdText, '4.5', '4.6', 'interaction');
        if (extracted.interactions) {
            console.log('✓ Found interactions');
        }
        // Section 4.6 - Fertility, pregnancy and lactation
        extracted.fertilityPregnancyLactation = this.extractSection(mdText, '4.6', '4.7', 'fertility');
        if (extracted.fertilityPregnancyLactation) {
            console.log('✓ Found fertility pregnancy lactation');
        }
        // Section 4.7 - Effects on ability to drive
        extracted.effectsOnDriving = this.extractSection(mdText, '4.7', '4.8', 'effects on ability to drive');
        if (extracted.effectsOnDriving) {
            console.log('✓ Found effects on driving');
        }
        // Section 4.8 - Undesirable effects (adverse reactions)
        extracted.adverseReactions = this.extractSection(mdText, '4.8', '4.9', 'undesirable effects');
        if (extracted.adverseReactions) {
            console.log('✓ Found adverse reactions');
        }
        // Section 4.9 - Overdose
        extracted.overdose = this.extractSection(mdText, '4.9', '5', 'overdose');
        if (extracted.overdose) {
            console.log('✓ Found overdose information');
        }
        // Section 5.1 - Pharmacodynamic properties
        extracted.pharmacologicalProperties = this.extractSection(mdText, '5.1', '5.2', 'pharmacodynamic properties');
        if (extracted.pharmacologicalProperties) {
            console.log('✓ Found pharmacodynamic properties');
        }
        // Section 5.2 - Pharmacokinetic properties
        extracted.pharmacokinetics = this.extractSection(mdText, '5.2', '5.3', 'pharmacokinetic properties');
        if (extracted.pharmacokinetics) {
            console.log('✓ Found pharmacokinetic properties');
        }
        // Section 5.3 - Preclinical safety data
        extracted.preclinicalData = this.extractSection(mdText, '5.3', '6', 'preclinical safety data');
        if (extracted.preclinicalData) {
            console.log('✓ Found preclinical data');
        }
        // Count how many sections were found
        const foundSections = Object.values(extracted).filter(v => v !== undefined).length;
        console.log(`📊 Extracted ${foundSections} sections successfully`);
        return extracted;
    }
    /**
     * Full parsing pipeline
     * @param mdText Markdown text from PDF
     */
    parseFullDocument(mdText) {
        // Extract basic info (not used in your case since CSV has it)
        // const basicInfo = this.extractBasicInfo(mdText);
        // Extract all sections
        const sections = this.parseDocument(mdText);
        return {
            // ...basicInfo, // Comment out if you don't need basic info from PDF
            ...sections
        };
    }
}
exports.EMAPDFParser = EMAPDFParser;
//# sourceMappingURL=EMAPDFParser.js.map