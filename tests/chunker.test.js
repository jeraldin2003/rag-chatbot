import test from "node:test";
import assert from "node:assert/strict";
import { chunkText } from "../src/utils/chunker.js";

test("chunkText splits text by sentences and respects size limits", () => {
  const sampleText =
    "The POSH policy applies to all employees. Freshers have a 6-month probation period. Working hours are 10 AM to 7 PM.";
  const chunks = chunkText(sampleText, 60, 15);

  assert.ok(chunks.length > 0);
  assert.ok(chunks[0].includes("POSH policy"));
});

test("chunkText handles empty input gracefully", () => {
  const chunks = chunkText("", 100, 20);
  assert.deepEqual(chunks, []);
});

test("chunkText handles single long sentence exceeding chunkSize", () => {
  const longSentence = "A".repeat(200);
  const chunks = chunkText(longSentence, 50, 10);
  assert.ok(chunks.length > 1);
});
