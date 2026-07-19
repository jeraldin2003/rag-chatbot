// src/routes/chat.js
import express from "express";
import askQuestion from "../services/ragService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { question, topK } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await askQuestion(question, topK || 5);
    res.json(result);
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "Failed to generate answer", details: err.message });
  }
});

export default router;