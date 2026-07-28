import "dotenv/config";
import { client } from "./qdrant.js";
import { EMBEDDING_DIM } from "./embedding.js";

await client.createCollection("hashes", {
  vectors: {
    size: 1,
    distance: "Cosine",
  },
});

await client.createCollection("items", {
  vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
});
await client.createPayloadIndex("items", {
  field_name: "content",
  field_schema: "text",
});

console.log("Text index created on 'content'");
console.log("✅ Qdrant collections created");