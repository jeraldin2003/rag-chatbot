import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.array("files", 10),
  uploadFile
);
export default router;