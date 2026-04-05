// =============================================================================
// RESUME ROUTES — Accepts PDF, DOC, DOCX, TXT, RTF, ODT, Images
// Location: backend/routes/resumeRoutes.js
// =============================================================================

import express from "express";
import multer  from "multer";
import path    from "path";
import { uploadResume } from "../controllers/resumeController.js";
import authMiddleware   from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Storage ──────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "resume-" + unique + path.extname(file.originalname));
    }
});

// ── Allowed types ─────────────────────────────────────────────────────────────
const ALLOWED_EXTS = /\.(pdf|doc|docx|txt|rtf|odt|jpg|jpeg|png|webp|bmp|tiff)$/i;

const ALLOWED_MIMES = new Set([
    "application/pdf",
    "application/msword",                                                       // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
    "text/plain",                                                               // .txt
    "application/rtf", "text/rtf",                                              // .rtf
    "application/vnd.oasis.opendocument.text",                                  // .odt
    "image/jpeg", "image/jpg", "image/png",
    "image/webp",  "image/bmp", "image/tiff",
]);

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        const extOk  = ALLOWED_EXTS.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = ALLOWED_MIMES.has(file.mimetype);
        if (extOk || mimeOk) return cb(null, true);
        cb(new Error(
            "Unsupported file type. Please upload PDF, DOC, DOCX, TXT, RTF, ODT, or an image."
        ));
    }
});

// ── Route ─────────────────────────────────────────────────────────────────────
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

export default router;