const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3";

export async function generateAnswerOllama(question, contextChunks, history = []) {
  const context = contextChunks
    .map((chunk, i) => {
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