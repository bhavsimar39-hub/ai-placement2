// backend/routes/dashboardRoutes.js
// Aggregates data from ALL platform features

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/data", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("name email resume readinessScore resumeCount activityHistory atsAnalysis loginHistory createdAt skills skillGaps jobMatches careerLevel careerScore")
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const activities = user.activityHistory || [];

        // ── Resume ──────────────────────────────────────────
        const resumeUploaded  = !!(user.resume?.filename) ||
            activities.some(a => a.type === "resume_upload" && a.status === "success");
        const resumeSkills    = user.resume?.skills    || user.skills    || [];
        const resumeAtsScore  = user.resume?.atsScore  || 0;
        const experienceLevel = user.resume?.experienceLevel || user.careerLevel || "Not analysed";

        // ── ATS ──────────────────────────────────────────────
        const atsHistory      = user.atsAnalysis || [];
        const latestAts       = atsHistory.length ? atsHistory[atsHistory.length - 1] : null;
        const atsScore        = latestAts?.score || resumeAtsScore || 0;
        const atsChecks       = atsHistory.length;

        // ── Skill Gap ────────────────────────────────────────
        const skillGapActs    = activities.filter(a => a.type === "skill_gap");
        const latestGap       = skillGapActs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        const skillGapScore   = latestGap?.metadata?.readinessScore || 0;
        const skillGapMissing = latestGap?.metadata?.missingCount   || (user.skillGaps?.length || 0);
        const skillGapTrack   = latestGap?.metadata?.trackTitle     || "";

        // ── Career DNA ───────────────────────────────────────
        const dnaActs         = activities.filter(a => a.type === "career_dna");
        const latestDna       = dnaActs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        const careerScore     = latestDna?.metadata?.careerScore     || user.careerScore || 0;
        const careerPaths     = latestDna?.metadata?.careerPaths     || 0;
        const dnaLevel        = latestDna?.metadata?.careerLevel     || experienceLevel;

        // ── Job Match ────────────────────────────────────────
        const matchActs       = activities.filter(a => a.type === "job_match");
        const latestMatch     = matchActs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        const jobMatchCount   = latestMatch?.metadata?.matchesFound  || user.jobMatches?.length || 0;
        const topJobRole      = latestMatch?.metadata?.topRole       || null;
        const topJobScore     = latestMatch?.metadata?.topScore      || 0;

        // ── NLP Analysis ─────────────────────────────────────
        const nlpActs         = activities.filter(a => a.type === "nlp_analysis" || a.type === "nlp");
        const latestNlp       = nlpActs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        const nlpDone         = nlpActs.length > 0;

        // ── Readiness (best of all sources) ─────────────────
        const readiness       = Math.max(
            user.readinessScore || 0,
            skillGapScore,
            atsScore > 0 ? Math.round(atsScore * 0.8) : 0
        );

        // ── Recent activity (last 5 across all types) ────────
        const recentActivity  = [...activities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(a => ({ type: a.type, title: a.title, timestamp: a.timestamp, status: a.status }));

        return res.json({
            success: true,

            // User
            userName:        user.name,
            memberSince:     user.createdAt,

            // Resume
            resumeUploaded,
            resumeSkills:    resumeSkills.slice(0, 12),
            skillCount:      resumeSkills.length,
            experienceLevel: dnaLevel,
            resumeCount:     user.resumeCount || 0,

            // ATS
            atsScore,
            atsChecks,

            // Readiness
            readiness,

            // Skill Gap
            skillGapScore,
            skillGapMissing,
            skillGapTrack,

            // Career DNA
            careerScore,
            careerPaths,
            careerLevel: dnaLevel,

            // Job Match
            jobMatchCount,
            topJobRole,
            topJobScore,

            // NLP
            nlpDone,

            // Activity
            recentActivity,

            // Skill chart data
            skillLabels: resumeSkills.slice(0, 6),
            skillValues: resumeSkills.slice(0, 6).map(() => Math.floor(Math.random() * 30) + 60),

            // Legacy fields (backward compat)
            jobMatches:    user.jobMatches || [],
            skillGaps:     user.skillGaps  || [],
            jobCount:      jobMatchCount,
            skillGapCount: skillGapMissing,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error loading dashboard data: " + err.message
        });
    }
});

export default router;