import fs from "fs/promises";
import path from "path";
import { checkDuplicate } from "../services/hashService.js";
import { processDocument } from "../services/documentService.js";

export async function uploadFile(req, res, next) {
  console.time("[upload] Total");
  const results = [];

  try {
    if (!req.files || req.files.length === 0) {
      const error = new Error("No files uploaded");
      error.statusCode = 400;
      throw error;
    }

    for (const file of req.files) {
      console.time(`[${file.originalname}] Total`);

      try {
        console.time(`[${file.originalname}] Hash check`);
        let fileHash, isDuplicate;
        try {
          const check = await checkDuplicate(file.path);
          fileHash = check.fileHash;
          isDuplicate = check.isDuplicate;
        } finally {
          console.timeEnd(`[${file.originalname}] Hash check`);
        }

        if (isDuplicate) {
          console.log("duplicate called....");
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
        if (file?.path && typeof file.path === "string") {
          const safePath = path.resolve(file.path);
          await fs.unlink(safePath).catch(() => {});
        }
      }
    }

    res.status(200).json({
      message: "Processing completed",
      totalFiles: req.files.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });

  } catch (err) {
    next(err);
  } finally {
    console.timeEnd("[upload] Total");
  }
}