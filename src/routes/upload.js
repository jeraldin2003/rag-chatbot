import express from "express";
import multer from "multer";
import { client } from "../config/Qdrant.js";

import upload_file from '../controller/upload_file.js'
const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/upload-pdf", upload.single("file"), upload_file);

export default router;