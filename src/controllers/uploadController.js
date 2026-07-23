import fs from "fs/promises";
import { checkDuplicate } from "../services/hashService.js";
import { processDocument } from "../services/documentService.js";

export async function uploadFile(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  console.time("[upload] Total");

  const results = [];

  try {
    for (const file of req.files) {
      console.time(`[${file.originalname}] Total`);

      try {
        console.time(`[${file.originalname}] Hash check`);
        const { fileHash, isDuplicate } = await checkDuplicate(file.path);
        console.timeEnd(`[${file.originalname}] Hash check`);

        if (isDuplicate) {
          results.push({
            filename: file.originalname,
            success: false,
            error: "Duplicate file detected",
          });
          continue;
        }

        const result = await processDocument(file, fileHash);

        results.push({
          filename: file.originalname,
          success: true,
          pages: result.numPages,
          chunksCreated: result.chunksCreated,
        });

      } catch (err) {
        results.push({
          filename: file.originalname,
          success: false,
          error: err.message,
        });
      } finally {
        console.timeEnd(`[${file.originalname}] Total`);
        await fs.unlink(file.path).catch(() => {});
      }
    }

    console.timeEnd("[upload] Total");

    res.status(200).json({
      message: "Processing completed",
      totalFiles: req.files.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });

  } catch (err) {
    console.timeEnd("[upload] Total");
    next(err);
  }
}