import express from "express";
import { calculateReadiness, getReadinessHistory } from "../controllers/readinessController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/readiness/calculate
router.post("/calculate", authMiddleware, calculateReadiness);

// GET /api/readiness/history
router.get("/history", authMiddleware, getReadinessHistory);

export default router;