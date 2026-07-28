import { vectorSearch } from "./retrievalService.js";
import { bm25 } from "./bm25Service.js";
import { rerank } from "./rerank.js";
import { logRetrievalTrace } from "../utils/logger.js";

const RRF_K = 60;
const CANDIDATE_POOL = 15;

function fuseWithRRF(vectorResults, bm25Results) {
  const scores = new Map();

  (vectorResults || []).forEach((doc, rank) => {
    const id = String(doc.id);
    scores.set(id, { doc, rrfScore: 1 / (RRF_K + rank + 1) });
  });

  (bm25Results || []).forEach((doc, rank) => {
    const id = String(doc.id);
    const rrf = 1 / (RRF_K + rank + 1);
    const existing = scores.get(id);
    if (existing) {
      existing.rrfScore += rrf;
    } else {
      scores.set(id, { doc, rrfScore: rrf });
    }
  });

  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, CANDIDATE_POOL)
    .map(({ doc, rrfScore }) => ({ ...doc, rrfScore }));
}

export async function hybridSearch(query, topK = 5) {
  try {
    if (!bm25.isInitialized) {
      await bm25.syncFromQdrant();
    }

    console.time("[hybridSearch] Vector + BM25 search");
    let vectorResults = [];
    let bm25Results = [];
    try {
      [vectorResults, bm25Results] = await Promise.all([
        vectorSearch(query, CANDIDATE_POOL),
        Promise.resolve(bm25.search(query, CANDIDATE_POOL)),
      ]);
    } finally {
      console.timeEnd("[hybridSearch] Vector + BM25 search");
    }

    const merged = fuseWithRRF(vectorResults, bm25Results);
    if (merged.length === 0) return [];

    console.time("[hybridSearch] Re-rank");
    let reranked = [];
    try {
      reranked = await rerank(query, merged, topK);
    } finally {
      console.timeEnd("[hybridSearch] Re-rank");
    }

    logRetrievalTrace({
      query,
      denseCount: vectorResults.length,
      bm25Count: bm25Results.length,
      fusedCount: merged.length,
      chunks: reranked,
    });

    return reranked;
  } catch (err) {
    console.error("[hybridSearch] Error performing hybrid search:", err.message);
    throw err;
  }
}
