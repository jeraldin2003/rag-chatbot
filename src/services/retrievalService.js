import { client } from "../config/qdrant.js";
import { embedText } from "../utils/geminiEmbed.js";
import { bm25 } from "./bm25Service.js";

const COLLECTION = "items";
const SIMILARITY_THRESHOLD = 0;
const RRF_K = 60; // Reciprocal Rank Fusion constant

export async function queryRelevantChunks(query, topK = 5) {
  if (!bm25.isInitialized) {
    await bm25.syncFromQdrant();
  }

  const candidateK = Math.max(topK * 3, 20);

  // 1. Dense Vector Search (Qdrant)
  const queryEmbedding = await embedText(query);
  const denseResults = await client.search(COLLECTION, {
    vector: queryEmbedding,
    limit: candidateK,
    score_threshold: SIMILARITY_THRESHOLD,
    with_payload: true,
  });

  const denseMap = new Map();
  denseResults.forEach((r, idx) => {
    denseMap.set(r.id, {
      rank: idx + 1,
      score: r.score,
      item: {
        id: r.id,
        content: r.payload.content,
        metadata: r.payload.metadata,
        created_at: r.payload.created_at,
      },
    });
  });

  // 2. Sparse Keyword Search (BM25)
  const bm25Results = bm25.search(query, candidateK);
  const bm25Map = new Map();
  bm25Results.forEach((r, idx) => {
    bm25Map.set(r.id, {
      rank: idx + 1,
      score: r.score,
      item: {
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        created_at: r.created_at,
      },
    });
  });

  // 3. Reciprocal Rank Fusion (RRF)
  const allDocIds = new Set([...denseMap.keys(), ...bm25Map.keys()]);
  const fused = [];

  for (const id of allDocIds) {
    const denseInfo = denseMap.get(id);
    const bm25Info = bm25Map.get(id);

    const denseScore = denseInfo ? 1 / (RRF_K + denseInfo.rank) : 0;
    const bm25Score = bm25Info ? 1 / (RRF_K + bm25Info.rank) : 0;

    const rrfScore = denseScore + bm25Score;
    const item = (denseInfo || bm25Info).item;

    fused.push({
      ...item,
      similarity: denseInfo ? denseInfo.score : 0,
      rrfScore,
    });
  }

  return fused.sort((a, b) => b.rrfScore - a.rrfScore).slice(0, topK);
}

