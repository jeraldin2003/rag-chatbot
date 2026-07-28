import "dotenv/config";
import { client } from "../config/Qdrant.js";

await client.createPayloadIndex("items", {
  field_name: "content",
  field_schema: "text",
});

console.log("✅ Full-text index created on 'items.content'");