import "server-only";
import { extractText } from "unpdf";

export interface ExtractedPdfResult {
  text: string;
  totalPages: number;
}

/**
 * Extrae texto de un archivo PDF de manera 100% nativa en JavaScript.
 * Es compatible con Node.js, Vercel Serverless y Edge Runtime (sin Python ni dependencias nativas).
 * Tarda típicamente entre 50ms y 300ms incluso en documentos de muchas páginas.
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<ExtractedPdfResult> {
  const uint8 = new Uint8Array(pdfBuffer);
  const result = await extractText(uint8);

  const rawPages = Array.isArray(result.text) ? result.text : [result.text];
  const cleanedPages: string[] = [];

  rawPages.forEach((pageText, idx) => {
    const trimmed = (pageText || "").trim();
    if (trimmed) {
      cleanedPages.push(`<!-- Página ${idx + 1} -->\n${trimmed}`);
    }
  });

  const fullText = cleanedPages.join("\n\n");
  return {
    text: fullText,
    totalPages: result.totalPages || cleanedPages.length,
  };
}
