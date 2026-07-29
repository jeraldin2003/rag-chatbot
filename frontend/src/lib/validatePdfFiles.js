import {
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_MIME,
  ACCEPTED_EXT,
} from "./uploadLimits";

function isPdf(file) {
  const ext = file.name.toLowerCase().endsWith(ACCEPTED_EXT);
  const mime = file.type === ACCEPTED_MIME;
  return ext || mime;
}

function formatSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate files for PDF upload.
 * @param {File[]} incoming - newly selected files
 * @param {File[]} [existingQueue=[]] - already queued files
 * @returns {{ validFiles: File[], errors: string[] }}
 */
export function validatePdfFiles(incoming, existingQueue = []) {
  const errors = [];
  const validFiles = [];
  const existingNames = new Set(existingQueue.map((f) => f.name));
  const remainingSlots = MAX_FILES - existingQueue.length;

  if (remainingSlots <= 0) {
    return {
      validFiles: [],
      errors: [`You can only queue up to ${MAX_FILES} files.`],
    };
  }

  let candidates = incoming;
  if (incoming.length > remainingSlots) {
    errors.push(
      `Only ${remainingSlots} more file${remainingSlots === 1 ? "" : "s"} can be added (max ${MAX_FILES} total). Extra files were ignored.`
    );
    candidates = incoming.slice(0, remainingSlots);
  }

  for (const file of candidates) {
    if (existingNames.has(file.name)) {
      errors.push(`"${file.name}" is already queued.`);
      continue;
    }

    if (!isPdf(file)) {
      errors.push(`"${file.name}" is not a PDF.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(
        `"${file.name}" exceeds the 10 MB limit (${formatSize(file.size)}).`
      );
      continue;
    }

    if (file.size === 0) {
      errors.push(`"${file.name}" is empty.`);
      continue;
    }

    validFiles.push(file);
    existingNames.add(file.name);
  }

  return { validFiles, errors };
}
