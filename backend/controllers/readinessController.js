
// backend/controllers/readinessController.js

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
            complexityBonus
        } = req.body;

        // Validate required fields
        if (cgpa === undefined || programmingSkills === undefined || projects === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required values for readiness calculation",
            });
        }

        // Calculate individual factor scores (out of 100)
        
        // 1. Academic Performance (20% weight)
        const academicScore = (cgpa / 10) * 100;

        // 2. Technical Skills (30% weight)
        const programmingScore = Math.min((programmingSkills / 5) * 100, 100);
        const certificationScore = Math.min((certifications / 10) * 100, 100);
        const technicalScore = (programmingScore * 0.3 + certificationScore * 0.3 + skillLevel * 0.4);

        // 3. Projects & Experience (25% weight)
        const projectScore = Math.min((projects / 10) * 100, 100);
        const internshipScore = (internships / 3) * 100;
        const projectsScore = (projectScore * 0.5 + internshipScore * 0.3 + Math.min(complexityBonus || 0, 100) * 0.2);

        // 4. Soft Skills (15% weight)
        const leadershipScore = (leadership / 3) * 100;
        const softSkillsScore = (leadershipScore * 0.4 + commSkills * 0.6);

        // 5. Interview Readiness (10% weight)
        const mockScore = Math.min((mockInterviews / 10) * 100, 100);
        const dsaScore = Math.min((dsaPractice / 500) * 100, 100);
        const interviewScore = (mockScore * 0.4 + dsaScore * 0.6);

        // Calculate weighted final score
        const readinessScore = Math.round(
            academicScore * 0.20 +
            technicalScore * 0.30 +
            projectsScore * 0.25 +
            softSkillsScore * 0.15 +
            interviewScore * 0.10
        );

        // Determine status
        let status;
        if (readinessScore >= 85) status = 'excellent';
        else if (readinessScore >= 70) status = 'good';
        else if (readinessScore >= 50) status = 'average';
        else status = 'poor';

        // Generate insights
        const insights = generateInsights({
            cgpa,
            programmingSkills,
            certifications,
            projects,
            internships,
            mockInterviews,
            dsaPractice
        });

        // Generate recommendations
        const recommendations = generateRecommendations({
            academicScore,
            technicalScore,
            projectsScore,
            softSkillsScore,
            interviewScore,
            programmingSkills,
            certifications,
            projects,
            mockInterviews,
            dsaPractice
        });

        res.json({
            success: true,
            readinessScore,
            status,
            breakdown: {
                academic: Math.round(academicScore),
                technical: Math.round(technicalScore),
                projects: Math.round(projectsScore),
                softSkills: Math.round(softSkillsScore),
                interview: Math.round(interviewScore)
            },
            insights,
            recommendations
        });

    } catch (error) {
        console.error('Readiness calculation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate readiness score",
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