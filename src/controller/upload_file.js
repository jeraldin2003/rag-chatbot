import fs from "fs/promises";
import  parsePdf  from "../utils/pdf_parser.js";
import  {chunkText } from "../utils/chunker.js";
import { hashFile } from "../utils/hashFile.js";
import { randomUUID } from "crypto";
import { embedTextBatch } from "../utils/geminiEmbed.js";
import { client } from "../config/Qdrant.js";

import { checkDuplicateFileHash } from '../helper/checkDuplicateHash.js'

const upload_file = async (req, res) => {
  console.time("Upload PDF Timer");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    //checks if content already exists.
    const fileHash = await hashFile(req.file.path);
    const isDuplicate = await checkDuplicateFileHash(fileHash) 
    if (isDuplicate){throw new Error('File Exists');}
    await client.upsert("hashes", {
      points: [
        {
          id: randomUUID(),
          vector: [0],
          payload: {
            file_hash: fileHash,
            filename: req.file.originalname,
            uploaded_at: new Date().toISOString(),
          },
        },
      ],
    });

    const { text, numPages } = await parsePdf(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(422).json({ error: "No extractable text found in PDF (might be scanned/image-based)" });
    }
    //array of chunks
    const chunks = chunkText(text);

    const embeddings = await embedTextBatch(chunks); // must match embedText's model/dims used at query time

    const points = chunks.map((chunk, idx) => ({
      id: randomUUID(),
      vector: embeddings[idx], // raw numeric array, matches queryEmbedding shape
      payload: {
        content: chunk,          // QdrantQuery reads payload.content
        metadata: {
          source: req.file.originalname,
          numPages,
          uploadedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        file_hash: fileHash,
      },
    }));

    await client.upsert("items", { points });

    res.status(200).json({
      message: "PDF processed and stored successfully",
      filename: req.file.originalname,
      pages: numPages,
      chunksCreated: chunks.length,
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  } finally {
    // Clean up temp file regardless of success/failure
    await fs.unlink(req.file.path).catch(() => {});
    console.timeEnd("Upload PDF Timer"); 
  }
}

export default upload_file;