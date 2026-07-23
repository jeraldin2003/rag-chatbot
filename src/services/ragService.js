import { queryRelevantChunks } from "./retrievalService.js";
import { generateAnswer } from "../utils/geminiGenerate.js";
import { generateAnswerOllama } from "../utils/ollamaGenerate.js";

export async function askQuestion(question, topK, provider) {
  console.time(`[chat/${provider}] Retrieval`);
  const relevantChunks = await queryRelevantChunks(question, topK);
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
      ? await generateAnswerOllama(question, relevantChunks)
      : await generateAnswer(question, relevantChunks);
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