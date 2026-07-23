import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAnswer(question, contextChunks, history = []) {
  try {
    const context = contextChunks
      .map((chunk) => {
        const source = chunk.metadata?.source || "Document";
        return `[Source: ${source}]\n${chunk.content}`;
      })
      .join("\n\n");

    const historyText =
      history.length > 0
        ? `Conversation History (Last 3 Turns):\n${history
            .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
            .join("\n")}\n\n`
        : "";

    const prompt = `You are a helpful assistant answering questions based ONLY on the provided context.

Instructions:
1. Cite your source document for every claim or fact in your answer using bracketed citations (e.g. "[POSH_POLICY.pdf]").
2. If the answer is NOT present in the context below, state explicitly: "I don't have enough information in the uploaded documents to answer that." Do NOT make anything up.
3. Stay strictly grounded in the context provided below.

${historyText}Context:
${context}

Question: ${question}

Answer:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("[geminiGenerate] Error generating answer:", err.message);
    throw new Error(`Failed to generate response using Gemini: ${err.message}`);
  }
}