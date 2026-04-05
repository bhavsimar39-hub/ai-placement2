import express from "express";
import { getSkillGap } from "../controllers/skillController.js";
import { semanticJDMatch } from "../services/bertService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/skills/gap — skill gap with BERT semantic matching
router.post("/gap", authMiddleware, getSkillGap);

// POST /api/skills/bert-jd-match — BERT semantic JD vs resume matching
router.post("/bert-jd-match", authMiddleware, async (req, res) => {
    try {
        const { resumeText, jdText } = req.body;
        if (!resumeText || !jdText) {
            return res.status(400).json({ success: false, message: "resumeText and jdText required" });
        }
        const result = await semanticJDMatch(resumeText, jdText);
        return res.json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

export default router;