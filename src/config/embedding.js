const MODEL_DIMENSIONS = {
  "all-minilm": 384,
  "nomic-embed-text": 768,
  "mxbai-embed-large": 1024,
};

const provider = process.env.EMBED_PROVIDER || "ollama";
const ollamaModel = process.env.OLLAMA_EMBED_MODEL || "all-minilm";

export const EMBEDDING_DIM =
  Number(process.env.EMBEDDING_DIM) ||
  (provider === "gemini" ? 384 : MODEL_DIMENSIONS[ollamaModel] || 384);

export function normalizeEmbedding(raw) {
  if (!raw) return raw;
  if (Array.isArray(raw) && Array.isArray(raw[0])) return raw[0];
  return raw;
}
