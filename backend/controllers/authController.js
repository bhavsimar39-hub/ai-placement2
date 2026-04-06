// backend/controllers/authController.js
// ✅ FIXED VERSION WITH PROPER LOGIN TRACKING

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const supabaseAnon  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Email helper ─────────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false }
        });
        await transporter.sendMail({
            from: `"AI Placement System" <${process.env.EMAIL_USER}>`,
            to, subject, html
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email error:", err.message);
    }
};

// ═══════════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════════
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // Register with Supabase
        const { data, error } = await supabaseAnon.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: `${process.env.FRONTEND_URL || "https://ai-placement-ihu6.onrender.com"}/confirm-email.html`
            }
        });

        if (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes("already registered")) {
                return res.status(400).json({ success: false, message: "Email already registered. Please sign in." });
            }
            throw new Error(error.message);
        }

        console.log("✅ Supabase signup initiated:", email);

        return res.status(201).json({
            success: true,
            message: "Account created! Please check your email to confirm your account.",
            requiresConfirmation: true
        });

    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// LOGIN - FIXED WITH PROPER TRACKING
// ═══════════════════════════════════════════════════════════════
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.toLowerCase().includes("email not confirmed")) {
                return res.status(401).json({
                    success: false,
                    message: "Please confirm your email first. Check your inbox.",
                    requiresConfirmation: true
                });
            }
            if (error.message.toLowerCase().includes("invalid login credentials")) {
                return res.status(400).json({ success: false, message: "Invalid email or password" });
            }
            return res.status(400).json({ success: false, message: error.message });
        }

        const { user: supabaseUser, session } = data;
        console.log("✅ Supabase login OK:", supabaseUser.email);

        // ✅ TRACK LOGIN PROPERLY
        const ipAddress = req.ip || req.connection?.remoteAddress || "Unknown";
        const userAgent = req.headers["user-agent"] || "Unknown";
        const loginTime = new Date();
        const name = supabaseUser.user_metadata?.name || email.split("@")[0];

        let mongoUser = await User.findOne({ email });

        if (!mongoUser) {
            // ✅ CREATE USER WITH ALL DEFAULT FIELDS
            mongoUser = await User.create({
                name,
                email,
                password: "supabase_managed",
                lastLogin: loginTime,
                loginHistory: [{
                    timestamp: loginTime,
                    ipAddress,
                    userAgent
                }],
                // ✅ INITIALIZE TRACKING FIELDS
                resumeCount: 0,
                resumeHistory: [],
                activityHistory: []
            });
            console.log("✅ MongoDB user created on first login");
        } else {
            // ✅ UPDATE EXISTING USER
            mongoUser.lastLogin = loginTime;
            
            // Initialize arrays if they don't exist
            if (!mongoUser.loginHistory) mongoUser.loginHistory = [];
            if (!mongoUser.resumeHistory) mongoUser.resumeHistory = [];
            if (!mongoUser.activityHistory) mongoUser.activityHistory = [];
            if (mongoUser.resumeCount === undefined) mongoUser.resumeCount = 0;
            
            // Add login record
            mongoUser.loginHistory.push({
                timestamp: loginTime,
                ipAddress,
                userAgent
            });
            
            // Keep last 50 logins
            if (mongoUser.loginHistory.length > 50) {
                mongoUser.loginHistory = mongoUser.loginHistory.slice(-50);
            }
        }

        // ✅ SAVE TO DATABASE
        await mongoUser.save();

        console.log('✅ Login tracked:', {
            user: mongoUser.email,
            totalLogins: mongoUser.loginHistory.length,
            resumeCount: mongoUser.resumeCount
        });

        // Send login alert email (fire and forget)
        sendEmail(email, "🔐 New Login to Your Account", `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                <h2 style="color:#10B981">Hi ${name}!</h2>
                <p>A new login to your AI Placement account was detected.</p>
                <table style="background:#f9fafb;padding:16px;border-radius:8px;width:100%">
                    <tr><td><b>Time:</b></td><td>${loginTime.toLocaleString()}</td></tr>
                    <tr><td><b>IP:</b></td><td>${ipAddress}</td></tr>
                </table>
                <p style="color:#6b7280;margin-top:16px">If this wasn't you, change your password immediately.</p>
            </div>
        `);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token: session.access_token,
            refreshToken: session.refresh_token,
            user: {
                id: mongoUser._id.toString(),
                name: mongoUser.name,
                email: mongoUser.email,
                totalLogins: mongoUser.loginHistory.length,
                resumeCount: mongoUser.resumeCount
            }
        });

    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// RESEND CONFIRMATION
// ═══════════════════════════════════════════════════════════════
export const resendConfirmation = async (req, res) => {
    try {
        const { email } = req.body;

        const { error } = await supabaseAnon.auth.resend({
            type: "signup",
            email,
            options: {
                emailRedirectTo: `${process.env.FRONTEND_URL || "https://ai-placement-ihu6.onrender.com"}/confirm-email.html`
            }
        });

        if (error) throw new Error(error.message);

        return res.json({
            success: true,
            message: "Confirmation email resent. Check your inbox."
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════
export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(200).json({ 
                success: true, 
                message: "Logged out (client-side)" 
            });
        }

        const token = authHeader.split(" ")[1];
        
        if (!token || token === 'null') {
            return res.status(200).json({ 
                success: true, 
                message: "Logged out" 
            });
        }

        try {
            const { createClient: mkClient } = await import("@supabase/supabase-js");
            const userSupabase = mkClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY,
                { 
                    global: { 
                        headers: { 
                            Authorization: `Bearer ${token}` 
                        } 
                    } 
                }
            );

            const { error } = await userSupabase.auth.signOut();
            
            if (error) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Logged out (with warnings)" 
                });
            }

            console.log('✅ Supabase session invalidated');
            return res.status(200).json({ 
                success: true, 
                message: "Logged out successfully" 
            });

        } catch (supabaseError) {
            return res.status(200).json({ 
                success: true, 
                message: "Logged out" 
            });
        }

    } catch (error) {
        return res.status(200).json({ 
            success: true, 
            message: "Logged out" 
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || "https://ai-placement-ihu6.onrender.com"}/reset-password.html`
        });

        if (error) throw new Error(error.message);

        return res.json({
            success: true,
            message: "Password reset email sent. Check your inbox."
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// UPDATE PASSWORD
// ═══════════════════════════════════════════════════════════════
export const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const { createClient: mkClient } = await import("@supabase/supabase-js");
        const userSupabase = mkClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const { error } = await userSupabase.auth.updateUser({ password: newPassword });

        if (error) throw new Error(error.message);

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET USER ANALYTICS
// ═══════════════════════════════════════════════════════════════
export const getUserAnalytics = async (req, res) => {
    try {
        const users = await User.find({})
            .select("name email lastLogin loginHistory createdAt resumeCount")
            .sort({ lastLogin: -1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return res.json({
            success: true,
            analytics: {
                totalUsers: users.length,
                activeToday: users.filter(u => u.lastLogin >= today).length,
                recentLogins: users.filter(u => u.lastLogin).slice(0, 10).map(u => ({
                    name: u.name,
                    email: u.email,
                    lastLogin: u.lastLogin,
                    totalLogins: (u.loginHistory || []).length,
                    resumeCount: u.resumeCount || 0
                }))
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: "Failed to load analytics" });
    }
};

// ═══════════════════════════════════════════════════════════════
// TEST EMAIL
// ═══════════════════════════════════════════════════════════════
export const testEmail = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false }
        });
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"AI Placement Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Test Email — AI Placement",
            html: `<h1>✅ Email working!</h1><p>${new Date().toLocaleString()}</p>`
        });
        return res.json({ success: true, message: "Test email sent!", messageId: info.messageId });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};