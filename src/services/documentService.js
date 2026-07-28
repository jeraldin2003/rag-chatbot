import parsePdf from "../utils/pdfParser.js";
import { chunkText } from "../utils/chunker.js";
import { embedTextBatch } from "../utils/ollamaEmbed.js";
import { normalizeEmbedding } from "../config/embedding.js";
import { client } from "../config/qdrant.js";
import { bm25 } from "./bm25Service.js";
import { randomUUID } from "crypto";

export async function processDocument(file, fileHash) {
  const prefix = `[${file.originalname}]`;

  try {
    let text;
    let numPages;

    console.time(`${prefix} PDF parsing`);
    try {
      const parsed = await parsePdf(file.path);
      text = parsed.text;
      numPages = parsed.numPages;
    } finally {
      console.timeEnd(`${prefix} PDF parsing`);
    }

    if (!text || text.trim().length === 0) {
      const error = new Error(
        "No extractable text found in PDF (might be scanned/image-based)"
      );
      error.statusCode = 422;
      throw error;
    }

    const chunks = chunkText(text);

    let embeddings;

    console.time(`${prefix} Embedding`);
    try {
      embeddings = await embedTextBatch(chunks);
    } finally {
      console.timeEnd(`${prefix} Embedding`);
    }

    const now = new Date().toISOString();
    const points = chunks.map((chunk, idx) => {
      const vector = normalizeEmbedding(embeddings[idx]);
      return {
        id: randomUUID(),
        vector,
        payload: {
          content: chunk,
          metadata: {
            source: file.originalname,
            numPages,
            uploadedAt: now,
          },
          created_at: now,
          fileHash,
        },
      };
    });

    console.time(`${prefix} Qdrant storage`);
    try {
      await client.upsert("items", { points });

      await client.upsert("hashes", {
        points: [
          {
            id: randomUUID(),
            vector: [0],
            payload: {
              file_hash: fileHash,
              filename: file.originalname,
              uploaded_at: now,
            },
          },
        ],
      });

      bm25.addDocuments(
        points.map((p) => ({
          id: p.id,
          content: p.payload.content,
          metadata: p.payload.metadata,
          created_at: p.payload.created_at,
        }))
      );
    } catch (error) {
      console.error(`${prefix} Qdrant storage failed:`, error.message);
      throw new Error(`Failed to store document in vector database: ${error}`);
    } finally {
      console.timeEnd(`${prefix} Qdrant storage`);
    }

    return {
      numPages,
      chunksCreated: chunks.length,
    };
  } catch (err) {
    console.error(`${prefix} Document processing failed:`, err.message);
    throw err;
  }
}