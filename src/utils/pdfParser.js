import { extractText, getDocumentProxy } from "unpdf";
import fs from "fs/promises";
import { toSafeUploadPath } from "./safeUploadPath.js";

export default async function parsePdf(filePath) {
  try {
    if (typeof filePath !== "string" || !filePath) {
      throw new Error("Invalid file path provided");
    }
    const safePath = toSafeUploadPath(filePath);
    const buffer = await fs.readFile(safePath);

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
