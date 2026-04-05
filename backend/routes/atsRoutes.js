// =============================================
// FILE 1: backend/routes/atsRoutes.js (CREATE THIS FILE)
// =============================================

import express from "express";
import multer from "multer";
import path from "path";
import { analyzeResume } from "../controllers/atsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const ALLOWED_EXTS  = /\.(pdf|doc|docx|txt|rtf|odt|jpg|jpeg|png|webp|bmp|tiff)$/i;
const ALLOWED_MIMES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/rtf', 'text/rtf',
    'application/vnd.oasis.opendocument.text',
    'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/bmp', 'image/tiff',
]);

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: function (req, file, cb) {
        const extOk  = ALLOWED_EXTS.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = ALLOWED_MIMES.has(file.mimetype);
        if (extOk || mimeOk) return cb(null, true);
        cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or an image.'));
    }
});

// ATS analyze route
router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);

export default router;