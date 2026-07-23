// one-time cleanup
import { client } from '../config/qdrant.js'
await client.deleteCollection("items");
await client.createCollection("items", { vectors: { size: 384, distance: "Cosine" } });