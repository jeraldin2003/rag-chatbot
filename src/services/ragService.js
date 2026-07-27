import { queryRelevantChunks } from "./retrievalService.js";
import { generateAnswer } from "../utils/geminiGenerate.js";
import { generateAnswerOllama } from "../utils/ollamaGenerate.js";

export async function askQuestion(question, topK, provider, history = []) {
  // Keep last 3 turns (up to 6 messages)
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];

  // Build contextual query combining recent user questions with current question
  const contextualQuery = buildContextualQuery(question, recentHistory);

  console.time(`[chat/${provider}] Retrieval`);
  const relevantChunks = await queryRelevantChunks(contextualQuery, topK);
  console.timeEnd(`[chat/${provider}] Retrieval`);

  if (relevantChunks.length === 0) {
    return {
      answer:
        "I don't have enough information in the uploaded documents to answer that.",
      sources: [],
      provider,
    };
  }

  console.time(`[chat/${provider}] LLM generation`);
  const answer =
    provider === "ollama"
      ? await generateAnswerOllama(question, relevantChunks, recentHistory)
      : await generateAnswer(question, relevantChunks, recentHistory);
  console.timeEnd(`[chat/${provider}] LLM generation`);

  return {
    answer,
    sources: relevantChunks.map((c) => ({
      id: c.id,
      source: c.metadata?.source,
      similarity: c.similarity,
    })),
    provider,
  };
}

function buildContextualQuery(question, history) {
  if (!history || history.length === 0) return question;

  const pastUserQuestions = history
    .filter((h) => h.role === "user" || h.role === "human")
    .map((h) => h.content)
    .join(" ");

  return pastUserQuestions ? `${pastUserQuestions} ${question}` : question;
}