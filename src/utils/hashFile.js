import crypto from "crypto";
import fs from "fs/promises";

import { toSafeUploadPath } from "./safeUploadPath.js";

export async function hashFile(filePath) {
  try {
    if (typeof filePath !== "string" || !filePath) {
      throw new Error("Invalid file path provided");
    }
    const safePath = toSafeUploadPath(filePath);
    const buffer = await fs.readFile(safePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
  } catch (err) {
    console.error("[hashFile] Error computing hash for file:", err.message);
    throw new Error(`Failed to compute file hash: ${err.message}`);
  }
}