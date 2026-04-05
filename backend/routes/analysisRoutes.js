import express from "express";
import { analyzeResume, getDashboard } from "../controllers/analysisController.js";
import authMiddleware from "../middleware/authMiddleware.js";  // No curly braces!

const router = express.Router();

router.post("/analyze", analyzeResume);
router.get("/dashboard", authMiddleware, getDashboard);

export default router;