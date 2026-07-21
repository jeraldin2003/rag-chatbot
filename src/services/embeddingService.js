import pgvector from "pgvector";
import pool from "../config/db.js";
import { embedTextBatch } from "../utils/geminiEmbed.js";

const BATCH_SIZE = 50;

function splitIntoBatches(arr, size) {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
}

export default async function embedAndStore(chunks, metadata = {}, fileHash = null) {
  const inserted = [];
  const batches = splitIntoBatches(chunks, BATCH_SIZE);

  for (const batch of batches) {
    const embeddings = await embedTextBatch(batch);

    for (let i = 0; i < batch.length; i++) {
      const result = await pool.query(
        `INSERT INTO documents (content, metadata, embedding, file_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, content, metadata, created_at`,
        [batch[i], JSON.stringify(metadata), pgvector.toSql(embeddings[i]), fileHash]
      );
      inserted.push(result.rows[0]);
    }
  }

  return inserted;
}