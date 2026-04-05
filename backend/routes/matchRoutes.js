import express from "express";
import { jobMatchController } from "../controllers/matchController.js";
import authMiddleware from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.post("/match", authMiddleware, jobMatchController);
 
export default router;
 