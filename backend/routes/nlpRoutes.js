// =============================================
// NLP Routes
// Location: backend/routes/nlpRoutes.js
// =============================================

import express from "express";
import multer from "multer";
import path from "path";
import { analyzeResumeNLP } from "../controllers/nlpController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allowed extensions
        const allowedExts = /\.(pdf|doc|docx|txt|rtf|odt|jpg|jpeg|png|webp|bmp|tiff)$/i;

        // Allowed MIME types
        const allowedMimes = [
            'application/pdf',
            'application/msword',                                                       // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
            'text/plain',                                                               // .txt
            'application/rtf', 'text/rtf',                                             // .rtf
            'application/vnd.oasis.opendocument.text',                                 // .odt
            'image/jpeg', 'image/jpg', 'image/png',
            'image/webp', 'image/bmp', 'image/tiff',
        ];

        const extOk  = allowedExts.test(path.extname(file.originalname).toLowerCase());
        const mimeOk = allowedMimes.includes(file.mimetype);

        if (extOk || mimeOk) {
            return cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, RTF, ODT, or an image.'));
        }
    }
});

// Analyze resume with NLP
router.post('/analyze-resume', authMiddleware, upload.single('resume'), analyzeResumeNLP);

// ── Groq AI endpoint — used by Career DNA NLP personality cards ──────────────
// Mirrors the Anthropic /v1/messages response shape so career-dna.js works unchanged
router.post('/claude', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: { message: 'messages array required' } });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: { message: 'GROQ_API_KEY not set in .env' } });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model:       'llama-3.3-70b-versatile',
                max_tokens:  1024,
                temperature: 0.7,
                messages:    messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });

        const groqData = await groqResponse.json();

        if (!groqResponse.ok) {
            return res.status(groqResponse.status).json({
                error: { message: groqData.error?.message || 'Groq API error' }
            });
        }

        // Convert Groq response → Anthropic shape so career-dna.js parseDnaResponse() works
        const text = groqData.choices?.[0]?.message?.content || '';
        return res.json({
            content: [{ type: 'text', text }]
        });

    } catch (err) {
        return res.status(500).json({ error: { message: err.message } });
    }
});

export default router;