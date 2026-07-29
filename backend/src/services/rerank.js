import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function rerank(query, candidates, topK) {
  if (candidates.length === 0) return [];

  const prompt = `Rate how relevant each numbered passage is to the question, on a scale of 0-10.
Respond with ONLY a JSON array of numbers, in the same order as the passages, nothing else.

Question: ${query}

Passages:
${candidates.map((c, i) => `[${i}] ${c.content.slice(0, 300)}`).join("\n\n")}`;

  let scores;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const match = responseText.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error("No JSON array found in response");
    }
    scores = JSON.parse(match[0]);
    if (!Array.isArray(scores)) {
      throw new Error("Rerank response was not a valid array");
    }
  } catch (err) {
    console.error("[rerank] Failed to parse re-rank response, falling back to RRF order:", err.message);
    return candidates.slice(0, topK);
  }

  return candidates
    .map((c, i) => {
      const rawScore = Array.isArray(scores) ? scores.at(i) : 0;
      const score = typeof rawScore === "number" ? rawScore : (Number(rawScore) || 0);
      return { ...c, rerankScore: score };
    })
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, topK);
}