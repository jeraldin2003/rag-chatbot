import express from "express";
import { handleChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/gemini", handleChat("gemini"));
router.post("/ollama", handleChat("ollama"));

export default router;