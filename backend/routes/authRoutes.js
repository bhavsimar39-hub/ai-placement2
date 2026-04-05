// backend/routes/authRoutes.js
import express from "express";
import {
    signup,
    login,
    logout,
    forgotPassword,
    resendConfirmation,
    updatePassword,
    getUserAnalytics,
    testEmail
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────
router.post("/signup",               signup);
router.post("/login",                login);
router.post("/logout",               logout);
router.post("/forgot-password",      forgotPassword);
router.post("/resend-confirmation",  resendConfirmation);
router.post("/update-password",       updatePassword);     // ✅ reset-password.html calls this

// ── Protected ────────────────────────────────────────────────────
router.get("/analytics",  authMiddleware, getUserAnalytics);
router.get("/test-email", authMiddleware, testEmail);

export default router;