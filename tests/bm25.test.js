import test from "node:test";
import assert from "node:assert/strict";
import { bm25 } from "../src/services/bm25Service.js";

test("bm25Service indexes and searches documents accurately", () => {
  bm25.clear();
  bm25.addDocuments([
    {
      id: "doc-1",
      content: "Sexual harassment policy 2013 governs workplace behavior.",
      metadata: { source: "POSH.pdf" },
      created_at: new Date().toISOString(),
    },
    {
      id: "doc-2",
      content: "Employees are eligible for paid maternity and paternity leave.",
      metadata: { source: "HR_Manual.pdf" },
      created_at: new Date().toISOString(),
    },
  ]);

  const results = bm25.search("harassment policy 2013", 5);
  assert.ok(results.length > 0);
  assert.equal(results[0].id, "doc-1");
  assert.ok(results[0].score > 0);
});

test("bm25Service returns empty array for non-matching query", () => {
  bm25.clear();
  bm25.addDocument({
    id: "doc-1",
    content: "Business casuals from Monday to Thursday.",
    metadata: { source: "Dress_Code.pdf" },
    created_at: new Date().toISOString(),
  });

  const results = bm25.search("quantum mechanics physics", 5);
  assert.deepEqual(results, []);
});
