// src/routes/upload.js
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import  parsePdf  from "../utils/pdf_parser.js";
import  {chunkText } from "../utils/chunker.js";
import embedAndStore from "../services/embeddingService.js"; // updated path
import { hashFile } from "../utils/hashFile.js";
import pool from "../config/db.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/upload-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileHash = await hashFile(req.file.path);

    const existing = await pool.query(
      `SELECT id FROM documents WHERE file_hash = $1 LIMIT 1`,
      [fileHash]
    );

    if (existing.rows.length > 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(409).json({
        error: "This file has already been uploaded",
      });
    }


    const { text, numPages } = await parsePdf(req.file.path);

    if (!text || text.trim().length === 0) {
      return res.status(422).json({ error: "No extractable text found in PDF (might be scanned/image-based)" });
    }
    //array of chunks
    const chunks = chunkText(text);

    // upload.js
    await embedAndStore(chunks, {
      source: req.file.originalname,
      numPages,
      uploadedAt: new Date().toISOString(),
    }, fileHash);

    res.status(200).json({
      message: "PDF processed and stored successfully",
      filename: req.file.originalname,
      pages: numPages,
      chunksCreated: chunks.length,
    });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  } finally {
    // Clean up temp file regardless of success/failure
    await fs.unlink(req.file.path).catch(() => {});
  }
});

export default router;