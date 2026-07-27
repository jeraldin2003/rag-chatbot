import "dotenv/config";
import express from "express";
import cors from "cors";
import { client } from "./src/config/qdrant.js";
import { bm25 } from "./src/services/bm25Service.js";
import uploadRouter from "./src/routes/upload.js";
import chatRouter from "./src/routes/chat.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

async function startServer() {
  const app = express();

  const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use("/upload_file", uploadRouter);
  app.use("/chat", chatRouter);

  app.use(errorHandler);

  try {
    await client.createPayloadIndex("hashes", {
      field_name: "file_hash",
      field_schema: "keyword",
    });
    console.log("✅ Qdrant payload index initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Qdrant payload index:", err.message);
    process.exit(1);
  }

  await bm25.syncFromQdrant();

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

startServer();