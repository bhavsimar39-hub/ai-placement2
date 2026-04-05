// backend/routes/interviewRoutes.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { groqEvaluateAnswer } from "../services/groqService.js";
import { semanticSimilarity } from "../services/bertService.js";

const router = express.Router();

// Get user's saved answers
router.get("/answers", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("interviewPrep");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Convert array to object for easier lookup
        const answersObj = {};
        if (user.interviewPrep) {
            user.interviewPrep.forEach(item => {
                const key = `${item.role}-${item.question}`;
                answersObj[key] = {
                    answer: item.answer,
                    practiced: item.practiced,
                    practicedAt: item.practicedAt
                };
            });
        }

        res.json({
            success: true,
            answers: answersObj
        });

    } catch (error) {
        console.error("Get answers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load answers"
        });
    }
});

// Save answer
router.post("/save-answer", authMiddleware, async (req, res) => {
    try {
        const { questionId, role, question, answer } = req.body;

        if (!questionId || !role || !question || !answer) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find if answer already exists
        const existingIndex = user.interviewPrep.findIndex(
            item => item.role === role && item.question === question
        );

        if (existingIndex !== -1) {
            // Update existing answer
            user.interviewPrep[existingIndex].answer = answer;
        } else {
            // Add new answer
            user.interviewPrep.push({
                role,
                question,
                answer,
                practiced: false
            });
        }

        await user.save();

        res.json({
            success: true,
            message: "Answer saved successfully"
        });

    } catch (error) {
        console.error("Save answer error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save answer"
        });
    }
});

// Mark question as practiced
router.post("/mark-practiced", authMiddleware, async (req, res) => {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        // Extract role and index from questionId (format: "Role-index")
        const parts = questionId.split("-");
        const index = parseInt(parts[parts.length - 1]);
        const role = parts.slice(0, -1).join("-");

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find the question
        const questionIndex = user.interviewPrep.findIndex(
            item => item.role === role && user.interviewPrep.indexOf(item) === index
        );

        if (questionIndex !== -1) {
            user.interviewPrep[questionIndex].practiced = true;
            user.interviewPrep[questionIndex].practicedAt = new Date();
        }

        await user.save();

        res.json({
            success: true,
            message: "Marked as practiced"
        });

    } catch (error) {
        console.error("Mark practiced error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark as practiced"
        });
    }
});

// Get statistics
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("interviewPrep");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const totalAnswered = user.interviewPrep.length;
        const totalPracticed = user.interviewPrep.filter(item => item.practiced).length;

        res.json({
            success: true,
            stats: {
                totalAnswered,
                totalPracticed
            }
        });

    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load statistics"
        });
    }
});

// ── AI Answer Evaluation (Groq + BERT) ──────────────────────
router.post("/evaluate-answer", authMiddleware, async (req, res) => {
    try {
        const { question, role, answer } = req.body;

        if (!question || !role || !answer) {
            return res.status(400).json({
                success: false,
                message: "question, role and answer are required"
            });
        }

        if (answer.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Answer is too short to evaluate (write at least 20 characters)"
            });
        }

        // Run Groq evaluation and BERT semantic relevance check in parallel
        const [groqResult, bertResult] = await Promise.allSettled([
            groqEvaluateAnswer(question, role, answer),
            // BERT: how semantically aligned is the answer to the question?
            // High score = answer is topically relevant; low score = answer is off-topic
            semanticSimilarity(answer, question)
        ]);

        const evaluation = groqResult.status === "fulfilled" ? groqResult.value : null;

        if (!evaluation) {
            return res.status(500).json({
                success: false,
                message: "AI evaluation failed. Please try again."
            });
        }

        // BERT relevance: 0-100 scale, null if service unavailable
        const relevanceScore = bertResult.status === "fulfilled" && bertResult.value != null
            ? Math.round(bertResult.value * 100)
            : null;

        res.json({
            success: true,
            evaluation: {
                ...evaluation,
                relevanceScore,          // BERT semantic relevance (how on-topic the answer is)
                bertPowered: relevanceScore !== null,
            }
        });

    } catch (error) {
        console.error("Evaluate answer error:", error);
        res.status(500).json({
            success: false,
            message: "Evaluation failed"
        });
    }
});

export default router;