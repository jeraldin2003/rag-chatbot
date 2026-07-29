import { askQuestion } from "../services/ragService.js";

export function handleChat(provider) {
  return async (req, res, next) => {
    const { question, topK, history } = req.body || {};

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.time(`[chat/${provider}] Total`);
    try {
      const result = await askQuestion(question.trim(), topK || 5, provider, history || []);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      console.timeEnd(`[chat/${provider}] Total`);
    }
  };
}
