import { client } from "../config/qdrant.js";
import { embedText } from "../utils/geminiEmbed.js";

const COLLECTION = "items";
const SIMILARITY_THRESHOLD = 0;

export async function queryRelevantChunks(query, topK = 5) {
  const queryEmbedding = await embedText(query);

  const results = await client.search(COLLECTION, {
    vector: queryEmbedding,
    limit: topK,
    score_threshold: SIMILARITY_THRESHOLD,
    with_payload: true,
  });

  return results.map((r) => ({
    id: r.id,
    content: r.payload.content,
    metadata: r.payload.metadata,
    created_at: r.payload.created_at,
    similarity: r.score,
  }));
}
