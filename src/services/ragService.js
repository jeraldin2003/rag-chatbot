import { hybridSearch } from "./hybridSearchService.js";
import { generateAnswer } from "../utils/geminiGenerate.js";
import { generateAnswerOllama } from "../utils/ollamaGenerate.js";

export async function askQuestion(question, topK, provider, history = []) {
  try {
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const contextualQuery = buildContextualQuery(question, recentHistory);

    console.time(`[chat/${provider}] Retrieval`);
    let relevantChunks = [];
    try {
      relevantChunks = await hybridSearch(contextualQuery, topK);
    } finally {
      console.timeEnd(`[chat/${provider}] Retrieval`);
    }

    if (!relevantChunks || relevantChunks.length === 0) {
      return {
        answer:
          "I don't have enough information in the uploaded documents to answer that.",
        sources: [],
        provider,
      };
    }

    console.time(`[chat/${provider}] LLM generation`);
    let answer = "";
    try {
      answer =
        provider === "ollama"
          ? await generateAnswerOllama(question, relevantChunks, recentHistory)
          : await generateAnswer(question, relevantChunks, recentHistory);
    } finally {
      console.timeEnd(`[chat/${provider}] LLM generation`);
    }

    return {
      answer,
      sources: relevantChunks.map((c) => ({
        id: c.id,
        source: c.metadata?.source,
        similarity: c.similarity ?? c.rerankScore,
      })),
      provider,
    };
  } catch (err) {
    console.error(`[ragService] Error in askQuestion (${provider}):`, err.message);
    throw err;
  }
}

function buildContextualQuery(question, history) {
  if (!history || history.length === 0) return question;

  const pastUserQuestions = history
    .filter((h) => h.role === "user" || h.role === "human")
    .map((h) => h.content)
    .join(" ");

  return pastUserQuestions ? `${pastUserQuestions} ${question}` : question;
}