// src/services/retrievalService.js
import pgvector from "pgvector";
import pool from "../config/db.js";
import { embedText } from "../utils/geminiEmbed.js";

const SIMILARITY_THRESHOLD = 0.75; // tune this based on testing

export default async function retrieveRelevant(query, topK = 5) {
  const queryEmbedding = await embedText(query);

  const result = await pool.query(
    `SELECT id, content, metadata, created_at,
            1 - (embedding <=> $1) AS similarity
     FROM documents
     WHERE 1 - (embedding <=> $1) > $3
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [pgvector.toSql(queryEmbedding), topK, SIMILARITY_THRESHOLD]
  );

  return result.rows;
}