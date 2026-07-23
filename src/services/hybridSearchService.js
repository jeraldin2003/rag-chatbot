import { queryRelevantChunks } from "./retrievalService.js";
import { keywordSearch } from "./keywordSearchService.js";
import { rerank } from "./rerank.js";

const RRF_K = 60;
const CANDIDATE_POOL = 15; // wider pool merged by RRF, narrowed by re-ranking

export async function hybridSearch(query, topK = 5) {
  try {
    console.time("[hybridSearch] Vector + keyword search");
    let vectorResults = [];
    let keywordResults = [];

    try {
      [vectorResults, keywordResults] = await Promise.all([
        queryRelevantChunks(query, CANDIDATE_POOL),
        keywordSearch(query, CANDIDATE_POOL),
      ]);
    } finally {
      console.timeEnd("[hybridSearch] Vector + keyword search");
    }

    const scores = new Map();

    (vectorResults || []).forEach((doc, rank) => {
      scores.set(doc.id, { doc, rrfScore: 1 / (RRF_K + rank + 1) });
    });

    (keywordResults || []).forEach((doc, rank) => {
      const rrf = 1 / (RRF_K + rank + 1);
      const existing = scores.get(doc.id);
      if (existing) {
        existing.rrfScore += rrf;
      } else {
        scores.set(doc.id, { doc, rrfScore: rrf });
      }
    });

    const merged = Array.from(scores.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, CANDIDATE_POOL)
      .map(({ doc }) => doc);

    if (merged.length === 0) return [];

    console.time("[hybridSearch] Re-rank");
    let reranked = [];
    try {
      reranked = await rerank(query, merged, topK);
    } finally {
      console.timeEnd("[hybridSearch] Re-rank");
    }

    return reranked;
  } catch (err) {
    console.error("[hybridSearch] Error performing hybrid search:", err.message);
    throw err;
  }
}