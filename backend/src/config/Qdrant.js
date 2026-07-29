import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.QDRANT_DB_ENDPOINT;
const API_KEY = process.env.QDRANT_DB_API;

export const client = new QdrantClient({
  url: URL,
  apiKey: API_KEY,
});
