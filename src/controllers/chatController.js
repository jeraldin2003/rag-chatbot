import { askQuestion } from "../services/ragService.js";

export function handleChat(provider) {
  return async (req, res, next) => {
    const { question, topK } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.time(`[chat/${provider}] Total`);
    try {
      const result = await askQuestion(question, topK || 5, provider);
      console.timeEnd(`[chat/${provider}] Total`);
      res.json(result);
    } catch (err) {
      console.timeEnd(`[chat/${provider}] Total`);
      next(err);
    }
  };
}
