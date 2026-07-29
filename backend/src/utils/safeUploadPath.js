import path from "path";

// We only ever read/delete files that multer stores under this directory.
// This prevents path traversal via user-influenced path strings.
export const UPLOAD_BASE_DIR = path.resolve("uploads");

function isWithinUploadDir(normalizedPath) {
  const prefix = `${UPLOAD_BASE_DIR}${path.sep}`;
  return normalizedPath === UPLOAD_BASE_DIR || normalizedPath.startsWith(prefix);
}

export function toSafeUploadPath(maybePath) {
  if (typeof maybePath !== "string" || !maybePath) {
    throw new Error("Invalid file path provided");
  }

  // multer's `file.path` is already a filename under UPLOAD_BASE_DIR, but
  // we sandbox it defensively by using only the basename.
  const fileName = path.basename(maybePath);

  // Extra guard: reject special names and null bytes.
  if (fileName === "." || fileName === ".." || fileName.includes("\0")) {
    throw new Error("Invalid file path provided");
  }

  // Avoid path.join/path.resolve on user-influenced values.
  const safePath = `${UPLOAD_BASE_DIR}${path.sep}${fileName}`;
  const normalized = path.normalize(safePath);

  if (!isWithinUploadDir(normalized)) {
    throw new Error("Invalid file path outside upload directory");
  }

  return normalized;
}

