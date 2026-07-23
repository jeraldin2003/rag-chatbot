import { extractText, getDocumentProxy } from "unpdf";
import fs from "fs/promises";

export default async function parsePdf(filePath) {
  try {
    const buffer = await fs.readFile(filePath);

    // unpdf works with a Uint8Array
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await extractText(pdf, { mergePages: true });

    return {
      text,
      numPages: totalPages,
    };
  } catch (err) {
    console.error("[pdfParser] Error parsing PDF file:", err.message);
    const error = new Error(`Failed to parse PDF document: ${err.message}`);
    error.statusCode = 422;
    throw error;
  }
}
