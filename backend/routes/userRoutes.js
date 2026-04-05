// backend/routes/userRoutes.js
// ✅ COMPLETE VERSION WITH CLEAR HISTORY ENDPOINT

import express from "express";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Supabase admin client
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ═══════════════════════════════════════════════════════════
// GET /profile - WITH ALL TRACKING DATA
// ═══════════════════════════════════════════════════════════
router.get("/profile", authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // ✅ COMPLETE USER PROFILE WITH ALL TRACKING
        const profile = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            preferredRole: user.preferredRole,
            experienceLevel: user.experienceLevel,
            expectedSalary: user.expectedSalary,
            bio: user.bio,
            
            // ✅ SCORES
            readinessScore: user.readinessScore || 0,
            atsScore: user.resume?.atsScore || 0,
            
            // ✅ RESUME TRACKING
            resumeCount: user.resumeCount || 0,
            resumeHistory: user.resumeHistory || [],
            resume: user.resume || null,
            
            // ✅ LOGIN TRACKING
            lastLogin: user.lastLogin,
            loginHistory: user.loginHistory || [],
            totalLogins: (user.loginHistory || []).length,
            
            // ✅ ACTIVITY
            activityHistory: user.activityHistory || [],
            atsAnalysis: user.atsAnalysis || [],
            
            // ✅ SKILLS
            userKnownSkills: user.userKnownSkills || [],
            
            // ✅ DATES
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };


        res.json({
            success: true,
            user: profile
        });

    } catch (err) {
        console.error('❌ Get profile error:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// ═══════════════════════════════════════════════════════════
// PUT /profile - Update profile
// ═══════════════════════════════════════════════════════════
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, phone, location, preferredRole, experienceLevel, expectedSalary, bio } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (name)            user.name            = name;
        if (phone !== undefined)         user.phone           = phone;
        if (location !== undefined)      user.location        = location;
        if (preferredRole !== undefined) user.preferredRole   = preferredRole;
        if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
        if (expectedSalary !== undefined) user.expectedSalary = expectedSalary;
        if (bio !== undefined)           user.bio             = bio;

        await user.save();


        res.json({ 
            success: true, 
            message: "Profile updated successfully", 
            user 
        });

    } catch (err) {
        console.error('❌ Update profile error:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// ═══════════════════════════════════════════════════════════
// POST /clear-history - ✅ CLEAR ALL HISTORY
// ═══════════════════════════════════════════════════════════
router.post("/clear-history", authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // ✅ CLEAR ALL HISTORY FIELDS
        user.activityHistory = [];
        user.atsAnalysis = [];
        user.loginHistory = [];
        user.resumeHistory = [];
        user.resumeCount = 0;

        await user.save();


        res.json({
            success: true,
            message: "All activity history cleared successfully"
        });

    } catch (error) {
        console.error('❌ Clear history error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to clear history",
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════
// DELETE /delete - Delete account
// ═══════════════════════════════════════════════════════════
router.delete("/delete", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Delete from Supabase auth
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(
            req.supabaseUid || user.supabaseId
        );

        // Delete from database
        const { error: dbErr } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", req.userId);

        if (dbErr) throw new Error(dbErr.message);


        res.json({ 
            success: true, 
            message: "Account deleted successfully" 
        });

    } catch (err) {
        console.error('❌ Delete account error:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// ═══════════════════════════════════════════════════════════
// POST /signout-all - Revoke all sessions
// ═══════════════════════════════════════════════════════════
router.post("/signout-all", authMiddleware, async (req, res) => {
    try {
        await supabaseAdmin.auth.admin.signOut(req.supabaseUid || "");
        
        
        res.json({ 
            success: true, 
            message: "All sessions signed out" 
        });

    } catch (err) {
        console.error('⚠️ Signout error:', err);
        res.json({ 
            success: true, 
            message: "Sessions cleared" 
        });
    }
});

// ═══════════════════════════════════════════════════════════
// GET /history - User activity history
// ═══════════════════════════════════════════════════════════
router.get("/history", authMiddleware, async (req, res) => {
    try {

        const users = await User.find({})
            .select("name email loginHistory activityHistory")
            .sort({ lastLogin: -1 });


        res.json({
            success: true,
            users: users.map(u => ({
                name: u.name,
                email: u.email,
                loginHistory: u.loginHistory || [],
                activityHistory: u.activityHistory || [],
                totalLogins: (u.loginHistory || []).length
            }))
        });

    } catch (error) {
        console.error("❌ Get history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load history",
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════
// GET /notifications - Get notification settings
// ═══════════════════════════════════════════════════════════
router.get("/notifications", authMiddleware, async (req, res) => {
    try {
        
        const user = await User.findById(req.userId).select("notifications");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            emailNotifications: user.notifications?.email !== false,
            weeklyDigest: user.notifications?.weeklyDigest !== false,
            careerTips: user.notifications?.careerTips || false
        });

    } catch (error) {
        console.error("❌ Get notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load notification settings",
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════
// PUT /notifications - Update notification settings
// ═══════════════════════════════════════════════════════════
router.put("/notifications", authMiddleware, async (req, res) => {
    try {
        
        const { emailNotifications, weeklyDigest, careerTips } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
                notifications: {
                    email: emailNotifications,
                    weeklyDigest: weeklyDigest,
                    careerTips: careerTips
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        res.json({
            success: true,
            message: "Notification preferences updated successfully"
        });

    } catch (error) {
        console.error("❌ Update notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update notification settings",
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════
// PUT /change-password - Change password
// ═══════════════════════════════════════════════════════════
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // For Supabase users, use Supabase password update
        if (user.supabaseId) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                user.supabaseId,
                { password: newPassword }
            );

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        } else {
            // Legacy MongoDB password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
        }


        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("❌ Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message
        });
    }
});

export default router;