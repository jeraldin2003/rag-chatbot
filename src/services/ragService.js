// src/services/ragService.js
import retrieveRelevant from "./retrievalService.js";
import { generateAnswer } from "../utils/geminiGenerate.js";

export default async function askQuestion(question, topK = 5) {
  const relevantChunks = await retrieveRelevant(question, topK);

  if (relevantChunks.length === 0) {
    return {
      answer: "I don't have enough information in the uploaded documents to answer that.",
      sources: [],
    };
  }

  const answer = await generateAnswer(question, relevantChunks);

  return {
    answer,
    sources: relevantChunks.map((c) => ({
      id: c.id,
      source: c.metadata?.source,
      similarity: c.similarity,
    })),
  };
}