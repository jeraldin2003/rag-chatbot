export function chunkText(text, chunkSize = 1000, overlap = 200) {
  // Clean up excessive whitespace/newlines from PDF extraction
  const cleaned = text.replace(/\s+/g, " ").trim();

  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = start + chunkSize;
    chunks.push(cleaned.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}