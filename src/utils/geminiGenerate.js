import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

export async function generateAnswer(question, contextChunks) {
  const context = contextChunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");

  const prompt = `You are a helpful assistant answering questions based only on the provided context.
  If the answer isn't in the context, say you don't have enough information to answer — do not make anything up.

  Context:
  ${context}

  Question: ${question}

  Answer:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}