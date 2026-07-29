export function logRetrievalTrace(traceData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: "RETRIEVAL_TRACE",
    query: traceData.query,
    denseCandidatesCount: traceData.denseCount || 0,
    bm25CandidatesCount: traceData.bm25Count || 0,
    fusedCandidatesCount: traceData.fusedCount || 0,
    topChunks: (traceData.chunks || []).map((c) => ({
      id: c.id,
      source: c.metadata?.source,
      similarity: c.similarity,
      rrfScore: c.rrfScore,
      rerankScore: c.rerankScore,
    })),
  };

  console.log(`\n🔍 [DEBUG LOG] Retrieval Trace:\n${JSON.stringify(logEntry, null, 2)}\n`);
}
