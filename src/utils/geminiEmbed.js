import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

const OUTPUT_DIM = 384;
const MAX_BATCH_SIZE = 100;

export async function embedText(text) {
  try {
    const result = await model.embedContent({
      content: {
        parts: [{ text }],
      },
      outputDimensionality: OUTPUT_DIM,
    });

    return result.embedding.values;
  } catch (err) {
    console.error("[geminiEmbed] Error generating embedding:", err.message);
    throw new Error(`Failed to generate Gemini embedding: ${err.message}`);
  }
}

export async function embedTextBatch(texts) {
  try {
    const embeddings = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      console.log(
        `Embedding batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}: ${batch.length} chunks`
      );

      const result = await model.batchEmbedContents({
        requests: batch.map((text) => ({
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text }],
          },
          outputDimensionality: OUTPUT_DIM,
        })),
      });

      embeddings.push(...result.embeddings.map((e) => e.values));
    }

    return embeddings;
  } catch (err) {
    console.error("[geminiEmbed] Error generating batch embeddings:", err.message);
    throw new Error(`Failed to generate Gemini batch embeddings: ${err.message}`);
  }
}