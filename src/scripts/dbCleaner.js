// one-time cleanup — recreates items collection with the configured embedding dimension
import "dotenv/config";
import { client } from "../config/Qdrant.js";
import { EMBEDDING_DIM } from "../config/embedding.js";

await client.deleteCollection("items");
await client.createCollection("items", {
  vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
});
await client.createPayloadIndex("items", {
  field_name: "content",
  field_schema: "text",
});
console.log(`✅ Recreated 'items' collection with vector size ${EMBEDDING_DIM}`);