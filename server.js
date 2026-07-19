import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initTable from "./src/config/InitDB.js";
import uploadRouter from "./src/routes/upload.js";
import retrieveRouter from "./src/routes/retrieve.js";
import chatRouter from "./src/routes/chat.js";
dotenv.config();
await initTable();


const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allow cookies or auth headers if needed
};
app.use(cors(corsOptions))
app.use(express.json());




app.use("/upload_file", uploadRouter);
app.use("/retrieve_embeddings", retrieveRouter);
app.use("/chat", chatRouter);


const PORT=process.env.PORT ? process.env.PORT : 8000
app.listen(PORT, () => console.log(`Server running on ${PORT}`));