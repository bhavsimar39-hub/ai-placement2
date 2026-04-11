// backend/routes/careerRoutes.js

import express  from "express";
import multer   from "multer";
import path     from "path";
import fs       from "fs";
import { analyzeCareerDNAController } from "../controllers/Careerdnacontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Ensure uploads/ exists on Render (ephemeral filesystem) ────────────────
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });

// ── Multer storage ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename:    (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "dna-" + unique + path.extname(file.originalname));
    }
});

const ALLOWED_EXTS  = /\.(pdf|doc|docx|txt|rtf|odt|jpg|jpeg|png|webp|bmp|tiff)$/i;
const ALLOWED_MIMES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain", "application/rtf", "text/rtf",
    "application/vnd.oasis.opendocument.text",
    "image/jpeg", "image/jpg", "image/png",
    "image/webp", "image/bmp", "image/tiff",
]);

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb) => {
        const extOk  = ALLOWED_EXTS.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = ALLOWED_MIMES.has(file.mimetype);
        if (extOk || mimeOk) return cb(null, true);
        cb(new Error("Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or an image."));
    }
});

// ── Routes ─────────────────────────────────────────────────────
// Frontend calls /api/career-dna/analyze-dna
router.post("/analyze-dna", authMiddleware, upload.single("resume"), analyzeCareerDNAController);

// Keep old /insights alias for backward compatibility
router.post("/insights",    authMiddleware, upload.single("resume"), analyzeCareerDNAController);

export default router;