// backend/routes/learningRoutes.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Save user's known skills
router.post("/save-skills", authMiddleware, async (req, res) => {
    try {
        const { skills } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: "Skills array is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { userKnownSkills: skills },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Skills saved successfully",
            skillCount: skills.length
        });

    } catch (error) {
        console.error("Save skills error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save skills"
        });
    }
});

// Get user's known skills
router.get("/user-skills", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("userKnownSkills");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            skills: user.userKnownSkills || []
        });

    } catch (error) {
        console.error("Get skills error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load skills"
        });
    }
});

// Get user's learning progress
router.get("/progress", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("learningProgress");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Convert array to object for easier lookup
        const progressObj = {};
        if (user.learningProgress) {
            user.learningProgress.forEach(item => {
                const key = `${item.skill}-${item.courseTitle}`;
                progressObj[key] = {
                    status: item.status,
                    progress: item.progress,
                    startedAt: item.startedAt,
                    completedAt: item.completedAt
                };
            });
        }

        res.json({
            success: true,
            progress: progressObj
        });

    } catch (error) {
        console.error("Get progress error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load learning progress"
        });
    }
});

// Update course status
router.post("/update-status", authMiddleware, async (req, res) => {
    try {
        const { courseId, status, courseTitle, courseUrl, platform, skill } = req.body;

        if (!courseId || !status) {
            return res.status(400).json({
                success: false,
                message: "Course ID and status are required"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find if course already exists
        const existingIndex = user.learningProgress.findIndex(
            item => item.skill === skill && item.courseTitle === courseTitle
        );

        const updateData = {
            skill,
            courseTitle,
            courseUrl,
            platform,
            status
        };

        if (status === "In Progress" && !user.learningProgress[existingIndex]?.startedAt) {
            updateData.startedAt = new Date();
        }

        if (status === "Completed") {
            updateData.completedAt = new Date();
            updateData.progress = 100;
        }

        if (existingIndex !== -1) {
            // Update existing course
            user.learningProgress[existingIndex] = {
                ...user.learningProgress[existingIndex].toObject(),
                ...updateData
            };
        } else {
            // Add new course
            user.learningProgress.push(updateData);
        }

        await user.save();

        res.json({
            success: true,
            message: "Status updated successfully"
        });

    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
});

// Update course progress
router.post("/update-progress", authMiddleware, async (req, res) => {
    try {
        const { courseId, progress, courseTitle, skill } = req.body;

        if (!courseId || progress === undefined) {
            return res.status(400).json({
                success: false,
                message: "Course ID and progress are required"
            });
        }

        const progressNum = Math.min(100, Math.max(0, parseInt(progress)));

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find course
        const courseIndex = user.learningProgress.findIndex(
            item => item.skill === skill && item.courseTitle === courseTitle
        );

        if (courseIndex !== -1) {
            user.learningProgress[courseIndex].progress = progressNum;

            // Auto-update status based on progress
            if (progressNum === 0) {
                user.learningProgress[courseIndex].status = "Not Started";
            } else if (progressNum === 100) {
                user.learningProgress[courseIndex].status = "Completed";
                user.learningProgress[courseIndex].completedAt = new Date();
            } else {
                user.learningProgress[courseIndex].status = "In Progress";
                if (!user.learningProgress[courseIndex].startedAt) {
                    user.learningProgress[courseIndex].startedAt = new Date();
                }
            }
        }

        await user.save();

        res.json({
            success: true,
            message: "Progress updated successfully"
        });

    } catch (error) {
        console.error("Update progress error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update progress"
        });
    }
});

// Get learning statistics
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("learningProgress");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const total = user.learningProgress.length;
        const completed = user.learningProgress.filter(item => item.status === "Completed").length;
        const inProgress = user.learningProgress.filter(item => item.status === "In Progress").length;
        const notStarted = user.learningProgress.filter(item => item.status === "Not Started").length;

        // Calculate average progress
        const totalProgress = user.learningProgress.reduce((sum, item) => sum + (item.progress || 0), 0);
        const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

        res.json({
            success: true,
            stats: {
                total,
                completed,
                inProgress,
                notStarted,
                avgProgress
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

export default router;