// src/routes/retrieve.js
import express from "express";
import retrieveRelevant from "../services/retrievalService.js";

const router = express.Router();

router.post("/retrieve", async (req, res) => {
  const { query, topK } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: "Query text is required" });
  }

  try {
    const results = await retrieveRelevant(query, topK || 5);
    res.json({ query, count: results.length, results });
  } catch (err) {
    console.error("Error in /retrieve:", err);
    res.status(500).json({ error: "Failed to retrieve relevant documents", details: err.message });
  }
});

export default router;