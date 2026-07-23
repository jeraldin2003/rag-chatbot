import { client } from "../config/qdrant.js";
import { hashFile } from "../utils/hashFile.js";

export async function checkDuplicate(filePath) {
  try {
    const fileHash = await hashFile(filePath);

    const result = await client.scroll("hashes", {
      filter: {
        must: [{ key: "file_hash", match: { value: fileHash } }],
      },
      limit: 1,
    });

    return { fileHash, isDuplicate: result.points.length > 0 };
  } catch (err) {
    console.error("[hashService] Error checking duplicate file:", err.message);
    throw new Error(`Failed to check file duplicate: ${err.message}`);
  }
}