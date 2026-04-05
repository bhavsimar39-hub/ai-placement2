// backend/controllers/readinessController.js
import { groqReadinessInsights } from '../services/groqService.js';

export const calculateReadiness = async (req, res) => {
    try {
        const {
            cgpa,
            programmingSkills,
            certifications,
            skillLevel,
            projects,
            internships,
            leadership,
            commSkills,
            mockInterviews,
            dsaPractice,
            complexityBonus,
            // New fields from the HTML form
            education,
            yearsExp,
            relevantExp,
            techSkills,
            portScore: portInput,
        } = req.body;

        // ── Calculate individual factor scores (out of 100) ───────────

        // 1. Education (20%) — CGPA + degree + certs
        const cgpaVal    = parseFloat(cgpa) || 0;
        const cgpaScore  = (cgpaVal / 10) * 100;
        const degreeVal  = parseFloat(education) || 50;            // dropdown value 0-100
        const certVal    = parseFloat(certifications) || 0;        // sum of checked cert values
        const eduScore   = Math.min(100, (cgpaScore * 0.5) + (degreeVal * 0.3) + (certVal * 4));

        // 2. Experience (30%) — years × relevance
        const years      = parseFloat(yearsExp) || parseFloat(internships) || 0;
        const relevance  = parseFloat(relevantExp) || 50;
        const expScore   = Math.min(100, (years / 20 * 100) * (relevance / 100));

        // 3. Technical Skills (25%) — count + level
        const techCount  = parseFloat(techSkills) || parseFloat(programmingSkills) || 0;
        const levelVal   = parseFloat(skillLevel) || 50;           // dropdown value 30-100
        const skillScore = Math.min(100, (techCount / 20 * 100 * 0.55) + (levelVal * 0.45));

        // 4. Portfolio (15%) — projects + quality
        const projCount  = parseFloat(projects) || 0;
        const portQual   = parseFloat(portInput) || parseFloat(complexityBonus) || 0;
        const portScore  = Math.min(100, (projCount / 10 * 100 * 0.6) + (portQual * 0.4));

        // 5. Soft Skills (10%) — leadership + comm
        const leadVal    = parseFloat(leadership) || 20;           // dropdown value 20-100
        const commVal    = parseFloat(commSkills) || 0;
        const softScore  = Math.min(100, (leadVal * 0.5) + (commVal / 50 * 100 * 0.5));

        // ── Weighted final score ──────────────────────────────────────
        const readinessScore = Math.min(100, Math.round(
            (eduScore   * 0.20) +
            (expScore   * 0.30) +
            (skillScore * 0.25) +
            (portScore  * 0.15) +
            (softScore  * 0.10)
        ));

        let status;
        if (readinessScore >= 85) status = 'Excellent — Job Ready!';
        else if (readinessScore >= 70) status = 'Good — Nearly Ready';
        else if (readinessScore >= 55) status = 'Average — Needs Work';
        else status = 'Below Average — Significant Gap';

        const breakdown = {
            education:  Math.round(eduScore),
            experience: Math.round(expScore),
            skills:     Math.round(skillScore),
            portfolio:  Math.round(portScore),
            softSkills: Math.round(softScore),
        };

        // ── Rule-based insights + recommendations ─────────────────────
        const insights        = generateInsights({ cgpa: cgpaVal, programmingSkills: techCount, certifications: certVal, projects: projCount, internships: years, mockInterviews: parseFloat(mockInterviews) || 0, dsaPractice: parseFloat(dsaPractice) || 0 });
        const recommendations = generateRecommendations({ academicScore: eduScore, technicalScore: skillScore, projectsScore: portScore, softSkillsScore: softScore, interviewScore: 0, programmingSkills: techCount, certifications: certVal, projects: projCount, mockInterviews: parseFloat(mockInterviews) || 0, dsaPractice: parseFloat(dsaPractice) || 0 });

        // ── Groq AI insights (non-fatal) ──────────────────────────────
        let aiInsights = null;
        try {
            aiInsights = await groqReadinessInsights({
                readinessScore,
                status,
                breakdown,
                inputData: {
                    cgpa:       cgpaVal,
                    degree:     req.body.degreeName || 'Bachelor\'s Degree',
                    yearsExp:   years,
                    relevantExp: relevance,
                    techSkills: techCount,
                    skillLevel: levelVal >= 75 ? 'Advanced' : levelVal >= 50 ? 'Intermediate' : 'Beginner',
                    projects:   projCount,
                },
            });
        } catch (groqErr) {
            console.warn('Groq readiness insights failed (non-fatal):', groqErr.message);
        }

        res.json({
            success: true,
            readinessScore,
            status,
            breakdown,
            insights,
            recommendations,
            aiInsights,   // null if Groq unavailable
        });

    } catch (error) {
        console.error('Readiness calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate readiness score',
            error: error.message
        });
    }
};

// Helper function to generate insights
function generateInsights(data) {
    const insights = [];

    // Academic Insight
    if (data.cgpa >= 8.5) {
        insights.push({
            icon: '🎓',
            title: 'Strong Academic Foundation',
            text: 'Your excellent CGPA demonstrates strong learning capabilities and dedication.'
        });
    } else if (data.cgpa >= 7.0) {
        insights.push({
            icon: '📚',
            title: 'Solid Academic Performance',
            text: 'Your academic record is competitive. Consider boosting with relevant certifications.'
        });
    } else {
        insights.push({
            icon: '⚠️',
            title: 'Academic Improvement Needed',
            text: 'Focus on improving grades in technical subjects to strengthen your profile.'
        });
    }

    // Technical Skills Insight
    if (data.programmingSkills >= 5) {
        insights.push({
            icon: '💻',
            title: 'Diverse Tech Stack',
            text: 'Your knowledge of multiple programming languages is a significant advantage.'
        });
    } else if (data.programmingSkills >= 3) {
        insights.push({
            icon: '🔧',
            title: 'Good Technical Base',
            text: 'Consider learning 1-2 more in-demand languages to broaden opportunities.'
        });
    } else {
        insights.push({
            icon: '📖',
            title: 'Expand Technical Skills',
            text: 'Focus on mastering at least 3-4 programming languages for better opportunities.'
        });
    }

    // Projects Insight
    if (data.projects >= 8) {
        insights.push({
            icon: '🚀',
            title: 'Impressive Project Portfolio',
            text: 'Your extensive project experience sets you apart from other candidates.'
        });
    } else if (data.projects >= 4) {
        insights.push({
            icon: '🛠️',
            title: 'Decent Project Experience',
            text: 'Add 2-3 more complex projects to make your portfolio more competitive.'
        });
    } else {
        insights.push({
            icon: '⚡',
            title: 'Build More Projects',
            text: 'Aim for at least 5-6 quality projects that showcase diverse skills.'
        });
    }

    // Interview Preparation Insight
    if (data.mockInterviews >= 5 && data.dsaPractice >= 200) {
        insights.push({
            icon: '🎯',
            title: 'Interview Ready',
            text: 'Your preparation level indicates strong readiness for technical interviews.'
        });
    } else {
        insights.push({
            icon: '💪',
            title: 'Interview Prep Needed',
            text: 'Complete more mock interviews and solve 300+ DSA problems for better preparation.'
        });
    }

    return insights;
}

// Helper function to generate recommendations
function generateRecommendations(scores) {
    const recommendations = [];

    // Academic recommendations
    if (scores.academicScore < 70) {
        recommendations.push({
            priority: 'high',
            text: 'Focus on improving your CGPA by dedicating more time to coursework and seeking academic help when needed.'
        });
    }

    // Technical skill recommendations
    if (scores.technicalScore < 70) {
        recommendations.push({
            priority: 'high',
            text: 'Enhance your technical skills by completing online courses and earning recognized certifications (AWS, Azure, Google Cloud).'
        });
    }

    if (scores.programmingSkills < 3) {
        recommendations.push({
            priority: 'high',
            text: 'Learn additional programming languages. Focus on Python, JavaScript, and Java as they are most in-demand.'
        });
    }

    // Project recommendations
    if (scores.projectsScore < 60) {
        recommendations.push({
            priority: 'high',
            text: 'Build 3-4 substantial projects that demonstrate full-stack capabilities and deploy them on GitHub with proper documentation.'
        });
    }

    if (scores.projects < 5) {
        recommendations.push({
            priority: 'medium',
            text: 'Start contributing to open-source projects on GitHub to gain real-world development experience.'
        });
    }

    // Interview prep recommendations
    if (scores.mockInterviews < 5) {
        recommendations.push({
            priority: 'high',
            text: 'Complete at least 8-10 mock interviews to build confidence and improve your performance.'
        });
    }

    if (scores.dsaPractice < 200) {
        recommendations.push({
            priority: 'high',
            text: 'Solve 300+ DSA problems on platforms like LeetCode, HackerRank, or CodeChef. Focus on medium and hard difficulty.'
        });
    }

    // Soft skills recommendations
    if (scores.softSkillsScore < 65) {
        recommendations.push({
            priority: 'medium',
            text: 'Develop leadership skills by taking initiative in group projects or joining student clubs/organizations.'
        });
    }

    // General recommendations
    if (scores.certifications < 3) {
        recommendations.push({
            priority: 'medium',
            text: 'Complete at least 3 industry-recognized certifications to validate your skills and stand out to employers.'
        });
    }

    recommendations.push({
        priority: 'low',
        text: 'Update your LinkedIn profile with all your projects, certifications, and achievements to improve visibility to recruiters.'
    });

    recommendations.push({
        priority: 'low',
        text: 'Create a personal portfolio website to showcase your projects and technical blog posts.'
    });

    return recommendations;
}

// Get user's readiness history
export const getReadinessHistory = async (req, res) => {
    try {
        // This would fetch from database in production
        // For now, return mock data
        res.json({
            success: true,
            history: [
                {
                    date: new Date().toISOString(),
                    score: 75,
                    status: 'good'
                }
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch readiness history"
        });
    }
};