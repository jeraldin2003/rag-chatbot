// src/utils/geminiEmbed.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const OUTPUT_DIM = 768; // must match your VECTOR(...) column size

export async function embedText(text) {
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: OUTPUT_DIM,
  });
  return result.embedding.values;
}

export async function embedTextBatch(texts) {
  const result = await model.batchEmbedContents({
    requests: texts.map((text) => ({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: OUTPUT_DIM,
    })),
  });
  return result.embeddings.map((e) => e.values);
}