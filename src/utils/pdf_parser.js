// src/utils/pdf_parser.js
import { extractText, getDocumentProxy } from "unpdf";
import fs from "fs/promises";

export default async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);

  // unpdf works with a Uint8Array
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  return {
    text,
    numPages: totalPages,
  };
}