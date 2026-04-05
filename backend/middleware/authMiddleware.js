// backend/middleware/authMiddleware.js
// ─────────────────────────────────────────────────────────────────
// 1. Verifies the Supabase JWT
// 2. Finds the matching MongoDB User document (creates it on first access)
// 3. Sets req.userId to the MongoDB ObjectId string
//    → ALL existing controllers (atsController, etc.) work unchanged
// ─────────────────────────────────────────────────────────────────

import dotenv from "dotenv";
dotenv.config();  // ← must run before createClient reads process.env

import { createClient } from "@supabase/supabase-js";
import User from "../models/User.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const authMiddleware = async (req, res, next) => {
    try {
        console.log("\n🔐 Auth Middleware Running (Supabase)...");

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token || token === "null" || token === "undefined") {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        // ── Step 1: Verify with Supabase ─────────────────────────
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

        if (error || !supabaseUser) {
            console.log("❌ Supabase token invalid:", error?.message);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token — please login again"
            });
        }

        // ── Step 2: Check email is confirmed ─────────────────────
        if (!supabaseUser.email_confirmed_at) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email before continuing. Check your inbox."
            });
        }

        // ── Step 3: Find or create MongoDB user ──────────────────
        let mongoUser = await User.findOne({ email: supabaseUser.email });

        if (!mongoUser) {
            // First time this user hits the backend — create their document
            const name = supabaseUser.user_metadata?.name
                      || supabaseUser.email.split("@")[0];
            mongoUser = await User.create({
                name,
                email:    supabaseUser.email,
                password: "supabase_managed"
            });
            console.log("✅ New MongoDB user document created for:", supabaseUser.email);
        }

        // ── Step 4: Attach MongoDB _id to request ─────────────────
        // All controllers use User.findById(req.userId) — this keeps them working
        req.userId      = mongoUser._id.toString();
        req.userEmail   = mongoUser.email;
        req.supabaseUid = supabaseUser.id;  // Supabase UUID for admin operations

        console.log("✅ Auth OK — MongoDB ID:", req.userId);
        next();

    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Authentication failed: " + error.message
        });
    }
};

export default authMiddleware;