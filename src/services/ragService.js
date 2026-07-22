import retrieveRelevant from "./retrievalService.js";
import { generateAnswer } from "../utils/geminiGenerate.js";
import { generateAnswerOllama } from "../utils/ollamaGenerate.js";
import QdrantQuery from './retrievalService.js'
async function askQuestion(question, topK, provider) {
  const relevantChunks = await QdrantQuery(question);
  
  if (relevantChunks.length === 0) {
    return {
      answer: "I don't have enough information in the uploaded documents to answer that.",
      sources: [],
      provider,
    };
  }

  const answer =
    provider === "ollama"
      ? await generateAnswerOllama(question, relevantChunks)
      : await generateAnswer(question, relevantChunks);

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

export async function askQuestionGemini(question, topK = 5) {
  return askQuestion(question, topK, "gemini");
}

export async function askQuestionOllama(question, topK = 5) {
  return askQuestion(question, topK, "ollama");
}