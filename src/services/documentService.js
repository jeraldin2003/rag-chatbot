import parsePdf from "../utils/pdfParser.js";
import { chunkText } from "../utils/chunker.js";
import { embedTextBatch } from "../utils/geminiEmbed.js";
import { client } from "../config/qdrant.js";
import { randomUUID } from "crypto";

export async function processDocument(file, fileHash) {
  console.time("[upload] PDF parsing");
  const { text, numPages } = await parsePdf(file.path);
  console.timeEnd("[upload] PDF parsing");

  if (!text || text.trim().length === 0) {
    const error = new Error(
      "No extractable text found in PDF (might be scanned/image-based)"
    );
    error.statusCode = 422;
    throw error;
  }

  const chunks = chunkText(text);

  console.time("[upload] Embedding");
  const embeddings = await embedTextBatch(chunks);
  console.timeEnd("[upload] Embedding");

  const points = chunks.map((chunk, idx) => ({
    id: randomUUID(),
    vector: embeddings[idx],
    payload: {
      content: chunk,
      metadata: {
        source: file.originalname,
        numPages,
        uploadedAt: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      fileHash,
    },
  }));

  console.time("[upload] Qdrant storage");
  await client.upsert("items", { points });

  await client.upsert("hashes", {
    points: [
      {
        id: randomUUID(),
        vector: [0],
        payload: {
          file_hash: fileHash,
          filename: file.originalname,
          uploaded_at: new Date().toISOString(),
        },
      },
    ],
  });
  console.timeEnd("[upload] Qdrant storage");

  return { numPages, chunksCreated: chunks.length };
}
