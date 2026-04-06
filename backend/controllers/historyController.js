// backend/controllers/historyController.js
// Personal activity + login + ATS history with BERT session clustering

import User from "../models/User.js";
import { semanticSimilarity } from "../services/bertService.js";

// ── Helpers ────────────────────────────────────────────────
const ATS_TYPES     = new Set(["ats_check", "ats", "ats_analysis"]);
const RESUME_TYPES  = new Set(["resume_upload", "upload", "resume"]);
const SKILL_TYPES   = new Set(["skill_gap"]);
const JOB_TYPES     = new Set(["job_match"]);
const NLP_TYPES     = new Set(["nlp_analysis", "nlp"]);

function isAts(type)    { return ATS_TYPES.has(type); }
function isResume(type) { return RESUME_TYPES.has(type); }

// Extract numeric ATS score from any metadata field variant
// Controllers save as: score, atsScore, ats_score — handle all
function extractAtsScore(metadata) {
    if (!metadata) return null;
    const raw = metadata.score ?? metadata.atsScore ?? metadata.ats_score ?? null;
    const n   = typeof raw === "number" ? raw : parseFloat(raw);
    return isNaN(n) ? null : n;
}

// ═══════════════════════════════════════════════════════════
// GET /api/history/my-history
// ═══════════════════════════════════════════════════════════
export const getPersonalHistory = async (req, res) => {
    try {
        const user = await User.findById(req.userId).lean();
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const activity = user.activityHistory || [];
        const logins   = user.loginHistory    || [];

        // ── All ATS activities (count) + scored subset (analytics) ──
        // Count ALL ats_check activities regardless of score presence
        const allAtsItems    = activity.filter(a => isAts(a.type));

        // For score analytics, use items that have a numeric score in any field
        const scoredAtsItems = allAtsItems.filter(a => extractAtsScore(a.metadata) !== null);
        const atsScores      = scoredAtsItems.map(a => extractAtsScore(a.metadata));

        // ── Logins today ────────────────────────────────────
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const loginsToday = logins.filter(l => new Date(l.timestamp) >= todayStart).length;

        // ── Resume uploads ──────────────────────────────────
        const resumeUploads = activity.filter(a => isResume(a.type)).length;

        // ── Skill gap checks ────────────────────────────────
        const skillGapChecks = activity.filter(a => SKILL_TYPES.has(a.type)).length;

        // ── Job match checks ────────────────────────────────
        const jobMatchChecks = activity.filter(a => JOB_TYPES.has(a.type)).length;

        // ── Stats object ─────────────────────────────────────
        const stats = {
            totalLogins:    logins.length,
            loginsToday,
            atsChecks:      allAtsItems.length,           // ALL ats checks, not just scored
            latestAtsScore: atsScores.length ? atsScores[atsScores.length - 1] : null,
            avgAtsScore:    atsScores.length
                                ? Math.round(atsScores.reduce((s, n) => s + n, 0) / atsScores.length)
                                : 0,
            bestAtsScore:   atsScores.length ? Math.max(...atsScores) : 0,
            readinessScore: user.readinessScore || 0,
            resumeUploads,
            skillGapChecks,
            jobMatchChecks,
            totalActivities: activity.length,
        };

        // ── Recent activity — latest 20 ──────────────────────
        const recentActivity = [...activity]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);

        // ── Recent logins — latest 10 ────────────────────────
        const recentLogins = [...logins]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        // ── ATS history — all scored checks, oldest→newest ──
        const atsHistory = [...scoredAtsItems]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(a => ({
                score:       extractAtsScore(a.metadata),
                title:       a.title       || "ATS Analysis",
                description: a.description || "",
                timestamp:   a.timestamp,
                metadata:    a.metadata    || {},
            }));

        // ── BERT session clustering (non-fatal) ──────────────
        // Groups temporally close + semantically similar activities
        // into named "focus sessions" so the user sees meaningful patterns.
        let sessionClusters = [];
        if (activity.length >= 2 && process.env.HUGGINGFACE_API_KEY) {
            try {
                sessionClusters = await buildSessionClusters(activity);
            } catch (_) {
                // BERT unavailable — surface what we have without clusters
            }
        }

        return res.json({
            success: true,
            stats,
            recentActivity,
            recentLogins,
            atsHistory,
            sessionClusters,   // [] when BERT unavailable — frontend handles gracefully
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load history: " + error.message,
        });
    }
};

// ═══════════════════════════════════════════════════════════
// BERT SESSION CLUSTERING
// Groups activities that are:
//   • within 2-hour time window of each other  AND
//   • semantically similar (cosine sim > 0.35)
// Returns named session summaries for the frontend.
// ═══════════════════════════════════════════════════════════
async function buildSessionClusters(activities) {
    // Sort chronologically
    const sorted = [...activities].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const clusters  = [];
    let current     = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        const timeDiff     = new Date(curr.timestamp) - new Date(prev.timestamp);
        const withinWindow = timeDiff < TWO_HOURS;

        if (!withinWindow) {
            clusters.push(current);
            current = [curr];
            continue;
        }

        // Use description or title as semantic proxy
        const textA = (prev.description || prev.title || prev.type).slice(0, 256);
        const textB = (curr.description || curr.title || curr.type).slice(0, 256);

        const sim = await semanticSimilarity(textA, textB);

        // Threshold 0.35 — loose enough to group same-domain activities
        // (e.g. two different ATS checks both score ~0.45 against each other)
        if (sim >= 0.35) {
            current.push(curr);
        } else {
            clusters.push(current);
            current = [curr];
        }
    }
    clusters.push(current);

    // Only return multi-activity clusters — single-item runs are not "sessions"
    return clusters
        .filter(c => c.length > 1)
        .map(c => {
            const types   = c.map(a => a.type);
            const typeSet = new Set(types);
            const start   = c[0].timestamp;
            const end     = c[c.length - 1].timestamp;
            const spanMin = Math.round((new Date(end) - new Date(start)) / 60000);

            return {
                label:      deriveSessionLabel(typeSet, types),
                activities: c.length,
                timeSpanMin: spanMin,
                types:      [...typeSet],
                start,
                end,
                // Collect any ATS scores within this session for quick summary
                atsScores: c
                    .filter(a => isAts(a.type) && extractAtsScore(a.metadata) !== null)
                    .map(a => extractAtsScore(a.metadata)),
            };
        });
}

// Map a cluster's activity types to a human-readable session label
function deriveSessionLabel(typeSet, typeList) {
    const hasResume  = typeList.some(t => isResume(t));
    const hasAts     = typeList.some(t => isAts(t));
    const hasNlp     = typeList.some(t => NLP_TYPES.has(t));
    const hasSkill   = typeList.some(t => SKILL_TYPES.has(t));
    const hasJob     = typeList.some(t => JOB_TYPES.has(t));

    if (hasResume && hasAts && hasNlp) return "Full Resume Review Session";
    if (hasResume && hasAts)           return "Resume & ATS Session";
    if (hasResume && hasNlp)           return "Resume Deep Analysis Session";
    if (hasNlp    && hasSkill)         return "Career Intelligence Session";
    if (hasSkill  && hasJob)           return "Job Search & Planning Session";
    if (typeList.every(t => isAts(t))) return "ATS Optimisation Session";
    if (typeList.every(t => NLP_TYPES.has(t))) return "NLP Analysis Session";
    if (hasSkill)                      return "Career Planning Session";
    if (hasJob)                        return "Job Discovery Session";
    return "Career Activity Session";
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/history/clear
// ═══════════════════════════════════════════════════════════
export const clearPersonalHistory = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            $set: { activityHistory: [], loginHistory: [] },
        });
        return res.json({ success: true, message: "History cleared successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};