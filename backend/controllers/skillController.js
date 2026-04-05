// backend/controllers/skillController.js

import User from "../models/User.js";
import { semanticSkillMatch } from "../services/bertService.js";
import { groqSkillGapInsights } from "../services/groqService.js";

// ── Alias map for flexible skill name matching ────────────
const ALIASES = {
    "js":           "javascript",
    "ts":           "typescript",
    "node":         "node.js",
    "nodejs":       "node.js",
    "reactjs":      "react",
    "vuejs":        "vue",
    "postgres":     "postgresql",
    "mongo":        "mongodb",
    "k8s":          "kubernetes",
    "ml":           "machine learning",
    "dl":           "deep learning",
    "golang":       "go",
    "cpp":          "c++",
    "py":           "python",
    "tf":           "tensorflow",
    "sklearn":      "scikit-learn",
    "powerbi":      "power bi",
    "tableau":      "tableau",
    "html/css":     "html",
    "css/html":     "html",
    "react/vue":    "react",
    "sql/nosql":    "sql",
    "aws/gcp/azure":"aws",
    "git":          "git",
    "github":       "git",
    "flutter/react native": "flutter",
    "dart/javascript":      "dart",
};

function norm(s) {
    const l = (s || "").toLowerCase().trim();
    return ALIASES[l] || l;
}

function flexMatch(userSkills, requiredSkill) {
    const rLower = requiredSkill.toLowerCase();
    const rNorm  = norm(rLower);

    // Split compound skills like "React / Vue", "Python / Java / Go"
    const parts  = rLower.split(/[/,&]/).map(p => p.trim()).filter(Boolean);

    return userSkills.some(u => {
        const uNorm = norm(u);
        return (
            uNorm === rNorm          ||         // exact normalised
            uNorm.includes(rNorm)    ||         // user has broader skill
            rNorm.includes(uNorm)    ||         // required is broader
            parts.some(p => uNorm.includes(norm(p)) || norm(p).includes(uNorm))
        );
    });
}

// ── GET /api/skills/gap ───────────────────────────────────
export const getSkillGap = async (req, res) => {
    try {
        const userId = req.userId;
        const { userSkills = [], requiredSkills = [], trackTitle = "", companyName = "" } = req.body;

        if (!Array.isArray(userSkills) || !Array.isArray(requiredSkills)) {
            return res.status(400).json({
                success: false,
                message: "userSkills and requiredSkills must be arrays",
            });
        }

        if (requiredSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: "requiredSkills cannot be empty",
            });
        }

        const userNorm = userSkills.map(norm);

        // ── Step 1: Fast exact/alias match ───────────────
        let matchedSkills = [];
        let missingSkills = [];

        requiredSkills.forEach(skill => {
            if (flexMatch(userNorm, skill)) matchedSkills.push(skill);
            else missingSkills.push(skill);
        });

        // ── Step 2: BERT semantic match for remaining gaps ─
        // Only run BERT on skills that exact match missed
        let semanticMatches = [];
        let semanticPairs   = [];
        if (missingSkills.length > 0 && process.env.HUGGINGFACE_API_KEY) {
            try {
                const bertResult = await semanticSkillMatch(
                    userNorm,       // use normalised skills so BERT sees "javascript" not "JS"
                    missingSkills,
                    0.65  // similarity threshold
                );
                // Skills BERT found semantically
                semanticMatches = bertResult.matched;
                semanticPairs   = bertResult.semanticPairs;
                // Update missing to only truly missing skills
                missingSkills   = bertResult.missing;
                // Merge semantic matches into matched
                matchedSkills   = [...matchedSkills, ...semanticMatches];
            } catch (_) {
                // BERT unavailable — stick with exact match result
            }
        }

        const readinessScore = requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 0;

        const grade = readinessScore >= 85 ? "Job Ready"
                    : readinessScore >= 65 ? "Strong Match"
                    : readinessScore >= 40 ? "Average"
                    :                        "Needs Work";

        // ── NLP insights via Groq (non-fatal) ─────────────
        let nlpInsights = null;
        if (process.env.GROQ_API_KEY) {
            try {
                nlpInsights = await groqSkillGapInsights({
                    matchedSkills,
                    missingSkills,
                    readinessScore,
                    grade,
                    trackTitle,
                    companyName,
                });
            } catch (_) { /* Groq unavailable — skip insights */ }
        }

        // ── Activity tracking (non-fatal) ─────────────────
        try {
            const user = await User.findById(userId);
            if (user) {
                if (!user.activityHistory) user.activityHistory = [];
                user.activityHistory.push({
                    type:        "skill_gap",
                    title:       "Skill Gap Analysis",
                    description: `${companyName || trackTitle || "Career"} — ${readinessScore}% match, ${missingSkills.length} skills missing`,
                    status:      "success",
                    timestamp:   new Date(),
                    metadata: {
                        trackTitle,
                        companyName,
                        readinessScore,
                        matchedCount: matchedSkills.length,
                        missingCount: missingSkills.length,
                        totalRequired: requiredSkills.length,
                        grade,
                    },
                });
                if (user.activityHistory.length > 100)
                    user.activityHistory = user.activityHistory.slice(-100);

                // Update readiness score if this is higher than stored
                if (!user.readinessScore || readinessScore > user.readinessScore) {
                    user.readinessScore = readinessScore;
                }

                await user.save();
            }
        } catch (_) {}

        return res.json({
            success:        true,
            missingSkills,
            matchedSkills,
            semanticMatches,          // skills matched by BERT (not exact)
            semanticPairs,            // explains what matched what
            readinessScore,
            grade,
            total:          requiredSkills.length,
            matchedCount:   matchedSkills.length,
            missingCount:   missingSkills.length,
            bertUsed:       semanticMatches.length > 0,
            nlpInsights,              // Groq career insights (null if unavailable)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Skill gap calculation failed: " + error.message,
        });
    }
};