import { client } from "../config/qdrant.js";
import { hashFile } from "../utils/hashFile.js";

export async function checkDuplicate(filePath) {
  const fileHash = await hashFile(filePath);

  try {
    const result = await client.scroll("hashes", {
      filter: {
        must: [{ key: "file_hash", match: { value: fileHash } }],
      },
      limit: 1,
      with_payload: false,
      with_vector: false,
    });

    return { fileHash, isDuplicate: result.points.length > 0 };
  } catch (err) {
    const isMissingCollection =
      err.status === 404 ||
      err.message?.toLowerCase().includes("not found") ||
      err.message?.toLowerCase().includes("doesn't exist");

    if (isMissingCollection) {
      console.warn("[hashService] 'hashes' collection not found — treating as no duplicate.");
      return { fileHash, isDuplicate: false };
    }

    console.error("[hashService] Error checking duplicate file:", err.message);
    throw new Error(`Failed to check file duplicate: ${err.message}`);
  }
}