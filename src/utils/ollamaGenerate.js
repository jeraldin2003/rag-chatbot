import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3";

console.log(OLLAMA_MODEL)

export async function generateAnswerOllama(question, contextChunks) {
  const context = contextChunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");

  const prompt = `You are a helpful assistant answering questions based only on the provided context.
If the answer isn't in the context, say you don't have enough information to answer — do not make anything up.

Context:
${context}

Question: ${question}

Answer:`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.response;
}