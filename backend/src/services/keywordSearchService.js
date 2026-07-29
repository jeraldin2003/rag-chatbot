import { client } from "../config/Qdrant.js";

const COLLECTION = "items";

export async function keywordSearch(query, topK = 10) {
  try {
    const result = await client.scroll(COLLECTION, {
      filter: {
        must: [
          {
            key: "content",
            match: { text: query },
          },
        ],
      },
      limit: topK,
      with_payload: true,
    });

    // scroll has no relevance score — rank is positional (order returned)
    return (result.points || []).map((p, i) => ({
      id: p.id,
      content: p.payload.content,
      metadata: p.payload.metadata,
      created_at: p.payload.created_at,
      rank: i,
    }));
  } catch (err) {
    console.error("[keywordSearch] Error executing keyword search:", err.message);
    // If text index is not configured or query fails, log error and return empty array for hybrid search fallback
    return [];
  }
}