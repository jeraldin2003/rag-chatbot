import ollama from "ollama";
import dotenv from "dotenv";
import { normalizeEmbedding } from "../config/embedding.js";

dotenv.config();

const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "all-minilm";

async function embedOne(text) {
  try {
    const response = await ollama.embed({
      model: OLLAMA_EMBED_MODEL,
      input: text,
    });
    return normalizeEmbedding(response.embeddings);
  } catch (err) {
    console.error("[ollamaEmbed] Error generating embedding:", err.message);
    throw new Error(`Failed to generate Ollama embedding: ${err.message}`);
  }
}

export async function embedText(text) {
  try {
    return await embedOne(text);
  } catch (err) {
    throw err;
  }
}

export async function embedTextBatch(texts) {
  try {
    const embeddings = [];
    for (let i = 0; i < texts.length; i++) {
      console.log(`Embedding chunk ${i + 1}/${texts.length}`);
      const temp = await embedOne(texts[i]);
      embeddings.push(temp);
    }
    return embeddings;
  } catch (err) {
    console.error("[ollamaEmbed] Batch embedding failed:", err.message);
    throw err;
  }
}