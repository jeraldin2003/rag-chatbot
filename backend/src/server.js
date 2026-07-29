import "dotenv/config";
import express from "express";
import cors from "cors";
import { client } from "./config/Qdrant.js";
import { EMBEDDING_DIM } from "./config/embedding.js";
import { bm25 } from "./services/bm25Service.js";
import uploadRouter from "./routes/upload.js";
import chatRouter from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";

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
    const items = await client.getCollection("items");
    const collectionDim = items.config?.params?.vectors?.size;
    if (collectionDim && collectionDim !== EMBEDDING_DIM) {
      console.error(
        `❌ Qdrant 'items' vector size is ${collectionDim}, but EMBEDDING_DIM is ${EMBEDDING_DIM}. ` +
          `Run: node src/scripts/dbCleaner.js then re-upload documents.`
      );
      process.exit(1);
    }
  } catch (err) {
    console.warn("⚠️ Could not verify Qdrant collection dimensions:", err.message);
  }

  try {
    await client.createPayloadIndex("hashes", {
      field_name: "file_hash",
      field_schema: "keyword",
    });
    console.log("✅ Qdrant payload index initialized");
  } catch (err) {
    console.log("Error in Initializing payload index:", err.message);
  }

  await bm25.syncFromQdrant();

  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Uncaught Rejection] at:", promise, "reason:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error("[Uncaught Exception]:", err.message, err.stack);
    process.exit(1);
  });

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

startServer().catch((err) => {
  console.error("❌ Critical server startup failure:", err.message);
  process.exit(1);
});