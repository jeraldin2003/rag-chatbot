import "dotenv/config";
import { client } from "./qdrant.js";

await client.createCollection("hashes", {
  vectors: {
    size: 1,
    distance: "Cosine",
  },
});

await client.createCollection("items", {
  vectors: { size: 384, distance: "Cosine" },
});

console.log("✅ Qdrant collections created");