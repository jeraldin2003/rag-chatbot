import { client } from "../config/Qdrant.js";
import { embedText } from "../utils/ollamaEmbed.js";
import { normalizeEmbedding } from "../config/embedding.js";

const COLLECTION = "items";
const SIMILARITY_THRESHOLD = 0;

export async function vectorSearch(query, topK = 5) {
  const rawEmbedding = await embedText(query);
  const vector = normalizeEmbedding(rawEmbedding);

  const denseResults = await client.search(COLLECTION, {
    vector,
    limit: topK,
    score_threshold: SIMILARITY_THRESHOLD,
    with_payload: true,
  });

  return (denseResults || []).map((r) => ({
    id: r.id,
    content: r.payload.content,
    metadata: r.payload.metadata,
    created_at: r.payload.created_at,
    similarity: r.score,
  }));
}
