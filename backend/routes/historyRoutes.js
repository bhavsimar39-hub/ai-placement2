// backend/routes/historyRoutes.js
// UPDATED - Personal history only

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getPersonalHistory, clearPersonalHistory } from "../controllers/historyController.js";

const router = express.Router();

// Get logged-in user's personal history
router.get("/my-history", authMiddleware, getPersonalHistory);

// Clear logged-in user's personal history
router.delete("/clear", authMiddleware, clearPersonalHistory);

export default router;