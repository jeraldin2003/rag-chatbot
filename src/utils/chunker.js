export function chunkText(text, chunkSize = 1000, overlap = 200) {
  // Clean whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  // Split into sentences (handles ., !, ?, followed by whitespace)
  const sentences =
    cleaned.match(/[^.!?]+[.!?]+[\])'"`’”]*|[^.!?]+$/g) ?? [];

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const s = sentence.trim();

    // If a single sentence is too large, split it as a fallback
    if (s.length > chunkSize) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }

      for (let i = 0; i < s.length; i += chunkSize - overlap) {
        chunks.push(s.slice(i, i + chunkSize).trim());
      }
      continue;
    }

    // Add sentence if it fits
    if ((current + " " + s).trim().length <= chunkSize) {
      current = (current + " " + s).trim();
    } else {
      // Save current chunk
      chunks.push(current.trim());

      // Create overlap using the end of previous chunk
      let overlapText = "";
      if (overlap > 0) {
        const words = current.split(" ");
        while (words.length && overlapText.length < overlap) {
          overlapText = words.pop() + (overlapText ? " " + overlapText : "");
        }
      }

      current = (overlapText + " " + s).trim();
    }
  }

  if (current) {
    chunks.push(current.trim());
  }

  return chunks;
}