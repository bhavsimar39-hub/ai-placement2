// backend/controllers/historyController.js
// PERSONAL HISTORY — Shows only logged-in user's own data

import User from "../models/User.js";

// ── Activity type normalisation map ───────────────────────────────────────────
// Keys = every type ever saved by any controller
// Values = canonical display category used by the frontend
const TYPE_MAP = {
    // Resume
    "resume":               "resume_upload",
    "resume_upload":        "resume_upload",
    "upload":               "resume_upload",
    // ATS
    "ats":                  "ats_check",
    "ats_check":            "ats_check",
    "ats_analysis":         "ats_check",
    // NLP / AI analysis
    "nlp":                  "nlp_analysis",
    "nlp_analysis":         "nlp_analysis",
    "nlp_check":            "nlp_analysis",
    // Career DNA
    "career_dna":           "career_dna",
    "career-dna":           "career_dna",
    "dna":                  "career_dna",
    "careerdna":            "career_dna",
    // Login
    "login":                "login",
    // Readiness / profile
    "readiness":            "readiness",
    "profile":              "profile_update",
    "profile_update":       "profile_update",
};

function normaliseType(rawType) {
    return TYPE_MAP[(rawType || "").toLowerCase()] || rawType || "other";
}

// ── Extract ATS score reliably from an activity record ─────────────────────────
function extractScore(activity) {
    // 1. From metadata (most reliable — set by ats-checker and resumeController)
    const m = activity.metadata || {};
    if (m.atsScore)  return m.atsScore;
    if (m.score)     return m.score;
    if (m.total)     return m.total;

    // 2. From description string — look for "ATS 72/100" or "Score: 72"
    const desc = activity.description || "";
    const patterns = [
        /ATS\s+(\d+)\s*\/\s*100/i,
        /score[:\s]+(\d+)/i,
        /(\d+)\s*\/\s*100/,
        /(\d{1,3})%/,
    ];
    for (const re of patterns) {
        const match = desc.match(re);
        if (match) {
            const n = parseInt(match[1]);
            if (n >= 0 && n <= 100) return n;
        }
    }
    return null;
}

// ── GET /history/my-history ───────────────────────────────────────────────────
export const getPersonalHistory = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select(
                "name email loginHistory lastLogin createdAt " +
                "atsAnalysis resume activityHistory readinessScore " +
                "resumeCount resumeHistory"
            )
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const loginHistory = user.loginHistory   || [];
        const atsHistory   = user.atsAnalysis    || [];
        const rawActivities= user.activityHistory|| [];

        // ── Normalise all activities ──────────────────────────────────────────
        const activities = rawActivities.map(a => ({
            ...a,
            type: normaliseType(a.type),
        }));

        // ── ATS score data ────────────────────────────────────────────────────
        // Collect from dedicated atsAnalysis array AND from activity records
        const atsFromActivities = activities
            .filter(a => a.type === "ats_check" || a.type === "nlp_analysis" || a.type === "resume_upload")
            .map(a => ({ score: extractScore(a), timestamp: a.timestamp, title: a.title, description: a.description }))
            .filter(a => a.score !== null && a.score >= 0);

        const atsFromArray = atsHistory.map(a => ({
            score: a.score,
            timestamp: a.analyzedAt || a.timestamp,
            title: "ATS Check",
            description: a.suggestions ? a.suggestions[0] || "" : "",
        })).filter(a => a.score != null);

        // Merge and deduplicate by timestamp proximity (5 min window)
        const allAts = [...atsFromArray, ...atsFromActivities]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const deduped = [];
        allAts.forEach(entry => {
            const last = deduped[deduped.length - 1];
            if (last && Math.abs(new Date(entry.timestamp) - new Date(last.timestamp)) < 5 * 60 * 1000) {
                // Keep the higher score
                if (entry.score > last.score) deduped[deduped.length - 1] = entry;
            } else {
                deduped.push(entry);
            }
        });

        const atsScores  = deduped.map(a => a.score);
        const avgAts     = atsScores.length ? Math.round(atsScores.reduce((s, n) => s + n, 0) / atsScores.length) : 0;
        const bestAts    = atsScores.length ? Math.max(...atsScores) : 0;
        const latestAts  = deduped.length   ? deduped[deduped.length - 1].score : 0;

        // ── Login stats ───────────────────────────────────────────────────────
        const totalLogins  = loginHistory.length;
        const loginsToday  = loginHistory.filter(l => new Date(l.timestamp || l.date) >= today).length;

        // ── Stats ─────────────────────────────────────────────────────────────
        const stats = {
            totalLogins,
            loginsToday,
            atsChecks:      deduped.length,
            latestAtsScore: latestAts,
            avgAtsScore:    avgAts,
            bestAtsScore:   bestAts,
            readinessScore: user.readinessScore || 0,
            resumeUploads:  (user.resumeCount || 0),
            totalActivities:activities.length,
            memberSince:    user.createdAt,
        };

        // ── Recent activity (last 30, newest first) ───────────────────────────
        const recentActivity = [...activities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 30)
            .map(a => ({
                type:        a.type,
                title:       a.title        || "Activity",
                description: a.description  || "",
                timestamp:   a.timestamp,
                status:      a.status       || "success",
                metadata:    a.metadata     || {},
            }));

        // ── Recent logins (last 15) ───────────────────────────────────────────
        const recentLogins = [...loginHistory]
            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
            .slice(0, 15)
            .map(l => ({
                timestamp:  l.timestamp  || l.date,
                ipAddress:  l.ipAddress  || l.ip  || null,
                userAgent:  l.userAgent  || l.device || null,
            }));

        return res.json({
            success: true,
            user: {
                name:        user.name,
                email:       user.email,
                memberSince: user.createdAt,
            },
            stats,
            recentActivity,
            recentLogins,
            atsHistory: deduped,   // full scored array for chart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load personal history",
            error: error.message,
        });
    }
};

// ── DELETE /history/clear ─────────────────────────────────────────────────────
export const clearPersonalHistory = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.activityHistory = [];
        user.loginHistory    = [];
        await user.save();

        return res.json({ success: true, message: "Activity history cleared successfully" });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clear history",
            error: error.message,
        });
    }
};