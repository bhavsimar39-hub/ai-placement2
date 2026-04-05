
import User from "../models/User.js";

export const analyzeResume = async (req, res) => {
    try {
        const { extractedText } = req.body;

        if (!extractedText) {
            return res.status(400).json({ success: false, message: "No resume text received" });
        }

        // --- Basic NLP Processing ---

        // Extract Skills (simple example)
        const skillsList = [
            "JavaScript", "Python", "React", "Node.js", "HTML",
            "CSS", "Machine Learning", "Communication", "Leadership",
            "C++", "SQL", "Data Analysis", "Teamwork"
        ];

        const foundSkills = skillsList.filter(skill =>
            extractedText.toLowerCase().includes(skill.toLowerCase())
        );

        // Extract Experience (very basic)
        let experience = extractedText.match(/\b(\d+)\s+years?/i);
        experience = experience ? experience[0] : "Not mentioned";

        // Summary (mock)
        const summary = extractedText.substring(0, 500) + "...";

        // ATS score (mock calculation)
        const atsScore = Math.min(100, foundSkills.length * 8);

        return res.json({
            success: true,
            summary,
            foundSkills,
            experience,
            atsScore
        });

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ success: false, message: "Analysis failed" });
    }
};

// NEW: Dashboard Data Controller
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Fetch user data
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Build dashboard data
        const dashboardData = {
            resumeUploaded: user.resumePath ? true : false,
            readiness: user.readinessScore || 0,
            jobMatches: user.matchedJobs?.length || 0,
            skillGap: user.missingSkills?.length || 0
        };

        return res.json(dashboardData);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard" });
    }
};
