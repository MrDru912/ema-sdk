// src/extractors/ema-pdf-extractor.ts

import axios from 'axios';
import { Mistral } from '@mistralai/mistralai';

// Interface for Mistral OCR response
interface MistralOCRPage {
  index: number;
  markdown: string;
  images: any[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}

interface MistralOCRResponse {
  pages: MistralOCRPage[];
}

/**
 * PDF Extractor for EMA documents
 * Uses pdf-parse for Node.js compatibility
 */
export class EMAPDFExtractor {
  private mistralClient: Mistral | undefined;

  constructor(mistral_api_key: string | undefined) {
    if (mistral_api_key !== undefined) {
      this.mistralClient = new Mistral({ apiKey: mistral_api_key });
    }
  }

  /**
   * Normalize product name for URL
   */
  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get EMA PDF URL
   */
  getPDFUrl(productName: string): string {
    const normalized = this.normalizeProductName(productName);
    return `https://www.ema.europa.eu/en/documents/product-information/${normalized}-epar-product-information_en.pdf`;
  }

  /**
   * Download PDF
   */
  async downloadPDF(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to download PDF: ${error.message}`);
      }
      throw error;
    }
  }

  async getMdOfEMADocByURL(pdf_url: string)  {
    if (this.mistralClient !== undefined) {
      const ocrResponse = await this.mistralClient.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: pdf_url
        },
        includeImageBase64: false
      }) as MistralOCRResponse;
  
      if (!ocrResponse || !ocrResponse.pages || ocrResponse.pages.length === 0) {
        console.error(`Failed to process document with OCR for url ${pdf_url}`);
        return null;
      }
        
      // Merge all pages into a single markdown document
      const mergedMarkdown = ocrResponse.pages
        .sort((a: MistralOCRPage, b: MistralOCRPage) => a.index - b.index)
        .map((page: MistralOCRPage) => page.markdown)
        .join('\n\n');  

      const preprocessedMarkdown = mergedMarkdown
        .replace(/\r\n/g, '\n')          // normalize line endings
        .replace(/[ \t]+\n/g, '\n')      // trim trailing spaces
        .replace(/\n{3,}/g, '\n\n');     // collapse extra newlines

      const cleanedMarkdown = preprocessedMarkdown.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ');
      console.log(cleanedMarkdown.substring(0, 20));
      return cleanedMarkdown;
    } else return "";
  }
}