import fs from "fs/promises";
import { checkDuplicate } from "../services/hashService.js";
import { processDocument } from "../services/documentService.js";

export async function uploadFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.time("[upload] Total");
  try {
    console.time("[upload] Hash check");
    const { fileHash, isDuplicate } = await checkDuplicate(req.file.path);
    console.timeEnd("[upload] Hash check");

    if (isDuplicate) {
      console.timeEnd("[upload] Total");
      return res.status(409).json({ error: "Duplicate file detected" });
    }

    const result = await processDocument(req.file, fileHash);

    console.timeEnd("[upload] Total");
    res.status(200).json({
      message: "PDF processed and stored successfully",
      filename: req.file.originalname,
      pages: result.numPages,
      chunksCreated: result.chunksCreated,
    });
  } catch (err) {
    console.timeEnd("[upload] Total");
    next(err);
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
}
