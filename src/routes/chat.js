import express from "express";
import { askQuestionGemini, askQuestionOllama } from "../services/ragService.js";

const router = express.Router();

router.post("/gemini", async (req, res) => {
  const { question, topK } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await askQuestionGemini(question, topK || 5);
    res.json(result);
  } catch (err) {
    console.error("Error in /chat/gemini:", err);
    res.status(500).json({ error: "Failed to generate answer", details: err.message });
  }
});

router.post("/ollama", async (req, res) => {
  const { question, topK } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await askQuestionOllama(question, topK || 5);
    res.json(result);
  } catch (err) {
    console.error("Error in /chat/ollama:", err);
    res.status(500).json({ error: "Failed to generate answer", details: err.message });
  }
});

export default router;