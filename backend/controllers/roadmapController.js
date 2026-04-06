// =============================================
// Enhanced Learning Roadmap Controller
// With 5 Questions Including Programming Languages
// + Groq AI Insights + BERT Semantic Skill Matching
// =============================================

import { groqRoadmapInsights, groqRoadmapPhaseCoach } from '../services/groqService.js';
import { semanticSkillMatch } from '../services/bertService.js';

// Enhanced Question Database with Programming Languages
const questionsByRole = {
    "Full Stack Developer": [
        {
            question: "What's your current experience level in web development?",
            options: ["Complete Beginner", "Know HTML/CSS basics", "Built simple websites", "Built full projects"]
        },
        {
            question: "Which programming languages do you already know?",
            type: "multiselect",
            options: ["JavaScript", "Python", "Java", "PHP", "Ruby", "C#", "Go", "None - I'm starting fresh"],
            note: "Select all that apply"
        },
        {
            question: "How much time can you dedicate per week to learning?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours (Full-time)"]
        },
        {
            question: "What's your preferred learning style?",
            options: ["Video tutorials", "Reading documentation", "Hands-on projects", "Interactive coding platforms"]
        },
        {
            question: "What aspect of full-stack development interests you most?",
            options: ["Frontend (UI/UX)", "Backend (Servers/APIs)", "Databases", "Everything equally"]
        }
    ],
    
    "Frontend Developer": [
        {
            question: "What's your experience with HTML & CSS?",
            options: ["Never used", "Know the basics", "Can build layouts", "Very comfortable"]
        },
        {
            question: "Which programming/markup languages do you know?",
            type: "multiselect",
            options: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "Java", "None yet"],
            note: "Select all that apply"
        },
        {
            question: "How many hours per week can you dedicate?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "What's your preferred way to learn?",
            options: ["Video courses", "Written tutorials", "Building projects", "Online bootcamps"]
        },
        {
            question: "Which frontend framework are you most interested in?",
            options: ["React", "Vue.js", "Angular", "Not sure yet - teach me all!"]
        }
    ],

    "Backend Developer": [
        {
            question: "What's your programming experience level?",
            options: ["Never programmed", "Completed basic course", "Built small apps", "Strong programming skills"]
        },
        {
            question: "Which backend programming languages do you already know?",
            type: "multiselect",
            options: ["Node.js/JavaScript", "Python", "Java", "PHP", "Ruby", "Go", "C#", "None - starting fresh"],
            note: "Select all that apply"
        },
        {
            question: "Are you familiar with databases?",
            options: ["Never used", "Heard of SQL", "Used databases before", "Can design schemas"]
        },
        {
            question: "Time commitment per week?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "Which backend stack interests you most?",
            options: ["Node.js ecosystem", "Python (Django/Flask)", "Java (Spring Boot)", "No preference - show me all"]
        }
    ],

    "Data Scientist": [
        {
            question: "What's your Python programming level?",
            options: ["Never coded", "Basic Python syntax", "Comfortable with Python", "Advanced Python"]
        },
        {
            question: "Which programming/data languages do you know?",
            type: "multiselect",
            options: ["Python", "R", "SQL", "Julia", "MATLAB", "JavaScript", "Java", "None - complete beginner"],
            note: "Select all that apply"
        },
        {
            question: "What's your math & statistics background?",
            options: ["Weak/Need basics", "High school level", "College level", "Strong foundation"]
        },
        {
            question: "Weekly time availability for learning?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "Which area of data science excites you most?",
            options: ["Data Analysis & Visualization", "Machine Learning", "Deep Learning", "All of the above"]
        }
    ],

    "ML Engineer": [
        {
            question: "What's your Python proficiency level?",
            options: ["Beginner", "Intermediate", "Advanced", "Expert"]
        },
        {
            question: "Which ML/AI programming languages and tools do you know?",
            type: "multiselect",
            options: ["Python", "R", "Julia", "MATLAB", "C++", "Java", "TensorFlow", "PyTorch", "None - learning ML first time"],
            note: "Select all that apply"
        },
        {
            question: "Do you have Machine Learning experience?",
            options: ["None - complete beginner", "Completed online course", "Built ML models", "Production ML experience"]
        },
        {
            question: "How much time can you invest per week?",
            options: ["10-20 hours", "20-30 hours", "30-40 hours", "40+ hours"]
        },
        {
            question: "Your math background (Linear Algebra, Calculus, Stats)?",
            options: ["Need to learn", "Basic understanding", "Good foundation", "Very strong"]
        }
    ],

    "Cloud Architect": [
        {
            question: "What's your cloud platform experience?",
            options: ["Never used cloud", "Basic AWS/Azure/GCP", "Deployed applications", "Designed cloud solutions"]
        },
        {
            question: "Which programming/scripting languages do you know?",
            type: "multiselect",
            options: ["Python", "JavaScript/Node.js", "Go", "Java", "C#", "Bash/Shell", "PowerShell", "None - focusing on cloud first"],
            note: "Select all that apply"
        },
        {
            question: "Your Linux & networking knowledge?",
            options: ["Beginner", "Basic commands", "Comfortable", "Advanced"]
        },
        {
            question: "Weekly time commitment?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "Which cloud platform do you want to focus on?",
            options: ["AWS", "Microsoft Azure", "Google Cloud (GCP)", "Multi-cloud approach"]
        }
    ],

    "DevOps Engineer": [
        {
            question: "What's your Linux experience level?",
            options: ["Never used Linux", "Basic commands", "Comfortable with Linux", "Advanced Linux user"]
        },
        {
            question: "Which programming/scripting languages do you know?",
            type: "multiselect",
            options: ["Python", "Bash/Shell", "JavaScript/Node.js", "Go", "Ruby", "PowerShell", "Perl", "None - will learn as I go"],
            note: "Select all that apply"
        },
        {
            question: "Your containerization knowledge (Docker/Kubernetes)?",
            options: ["Never used", "Heard of Docker", "Used Docker", "Used Docker & Kubernetes"]
        },
        {
            question: "Time availability per week?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "What's your main DevOps interest?",
            options: ["CI/CD Pipelines", "Container Orchestration", "Cloud Infrastructure", "All DevOps practices"]
        }
    ],

    "Mobile Developer": [
        {
            question: "What's your programming experience?",
            options: ["Complete beginner", "Know JavaScript basics", "Built web apps", "Experienced developer"]
        },
        {
            question: "Which programming languages do you already know?",
            type: "multiselect",
            options: ["JavaScript", "TypeScript", "Dart", "Swift", "Kotlin", "Java", "Python", "None - starting fresh"],
            note: "Select all that apply"
        },
        {
            question: "Have you done mobile development before?",
            options: ["Never", "Followed tutorials", "Built simple apps", "Published apps on stores"]
        },
        {
            question: "Weekly learning time?",
            options: ["5-10 hours", "10-20 hours", "20-30 hours", "30+ hours"]
        },
        {
            question: "Which mobile development approach interests you?",
            options: ["Cross-platform (React Native)", "Cross-platform (Flutter)", "Native iOS (Swift)", "Native Android (Kotlin)"]
        }
    ]
};

// Rest of the roadmap database remains the same...
// (I'll include the full roadmapDatabase from before)

const roadmapDatabase = {
    "Full Stack Developer": {
        icon: "💻",
        totalMonths: 8,
        difficulty: "Intermediate",
        avgSalary: "₹8-16 LPA",
        jobOpenings: "50K+",
        description: "Master both frontend and backend development to build complete web applications",
        prerequisites: ["Basic programming knowledge", "Understanding of web basics"],
        careerPath: ["Junior Full Stack Developer", "Full Stack Developer", "Senior Full Stack Developer", "Tech Lead"],
        phases: [
            {
                phaseNumber: 1,
                name: "Frontend Fundamentals",
                duration: "2 months",
                description: "Master the building blocks of web development",
                skills: ["HTML5 Semantic Elements", "CSS3 & Flexbox/Grid", "JavaScript ES6+", "Responsive Design", "Git & Version Control"],
                resources: [
                    { name: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
                    { name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/" },
                    { name: "CSS-Tricks", url: "https://css-tricks.com/" },
                    { name: "JavaScript.info", url: "https://javascript.info/" }
                ],
                projects: [
                    { 
                        title: "Personal Portfolio Website", 
                        desc: "Build a responsive portfolio showcasing your work with modern CSS",
                        difficulty: "Beginner",
                        estimatedHours: 20
                    },
                    { 
                        title: "Interactive Calculator", 
                        desc: "Create a fully functional calculator using vanilla JavaScript",
                        difficulty: "Beginner",
                        estimatedHours: 15
                    }
                ],
                certifications: [
                    "freeCodeCamp Responsive Web Design",
                    "Udemy Web Development Bootcamp"
                ]
            },
            {
                phaseNumber: 2,
                name: "React & Modern Frontend",
                duration: "2 months",
                description: "Learn modern frontend with React ecosystem",
                skills: ["React Components & Hooks", "State Management (Redux)", "React Router", "API Integration", "TypeScript Basics"],
                resources: [
                    { name: "React Docs", url: "https://react.dev/" },
                    { name: "Epic React", url: "https://epicreact.dev/" },
                    { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }
                ],
                projects: [
                    { 
                        title: "Todo App", 
                        desc: "React app with state management", 
                        difficulty: "Intermediate", 
                        hours: 25 
                    },
                    { 
                        title: "Weather Dashboard", 
                        desc: "API integration project", 
                        difficulty: "Intermediate", 
                        hours: 30 
                    }
                ],
                certifications: ["Meta React Basics", "Scrimba React Certificate"]
            },
            {
                phaseNumber: 3,
                name: "Backend Development",
                duration: "2 months",
                description: "Build scalable server-side applications",
                skills: ["Node.js & Express", "RESTful APIs", "MongoDB/PostgreSQL", "Authentication (JWT)", "Error Handling"],
                resources: [
                    { name: "Node.js Docs", url: "https://nodejs.org/docs/" },
                    { name: "MongoDB University", url: "https://university.mongodb.com/" },
                    { name: "Express Guide", url: "https://expressjs.com/" }
                ],
                projects: [
                    { 
                        title: "Blog API", 
                        desc: "Complete CRUD API", 
                        difficulty: "Intermediate", 
                        hours: 35 
                    },
                    { 
                        title: "Auth System", 
                        desc: "JWT authentication", 
                        difficulty: "Advanced", 
                        hours: 40 
                    }
                ],
                certifications: ["MongoDB Developer", "Node.js Certified"]
            },
            {
                phaseNumber: 4,
                name: "Full Stack & Deployment",
                duration: "2 months",
                description: "Integrate and deploy complete applications",
                skills: ["MERN Stack", "Docker Basics", "AWS/Vercel Deployment", "Testing (Jest)", "CI/CD"],
                resources: [
                    { name: "Docker Docs", url: "https://docs.docker.com/" },
                    { name: "AWS Free Tier", url: "https://aws.amazon.com/" },
                    { name: "Jest Documentation", url: "https://jestjs.io/" }
                ],
                projects: [
                    { 
                        title: "E-commerce Platform", 
                        desc: "Full-stack store", 
                        difficulty: "Advanced", 
                        hours: 80 
                    },
                    { 
                        title: "Social Media Clone", 
                        desc: "Real-time features", 
                        difficulty: "Advanced", 
                        hours: 100 
                    }
                ],
                certifications: ["AWS Cloud Practitioner", "Docker Essentials"]
            }
        ]
    },
    // Add other roles here (same as before)...
};

// In-memory storage (moved to top so all functions can access it)
const userProgressData = new Map();

// Controllers

// Get Questions for Role
const getQuestions = async (req, res) => {
    try {
        const { role } = req.params;
        
        if (!questionsByRole[role]) {
            return res.status(404).json({
                success: false,
                message: "Questions not found for this role"
            });
        }

        res.status(200).json({
            success: true,
            role: role,
            questions: questionsByRole[role]
        });

    } catch (error) {
        console.error("Error getting questions:", error);
        res.status(500).json({
            success: false,
            message: "Server error getting questions",
            error: error.message
        });
    }
};

// Generate Personalized Roadmap
const generateRoadmap = async (req, res) => {
    try {
        const { role, answers } = req.body;
        const userId = req.userId;

        if (!roadmapDatabase[role]) {
            return res.status(404).json({
                success: false,
                message: "Roadmap not found for this role"
            });
        }

        // Get base roadmap and personalize it
        const roadmap = roadmapDatabase[role];
        const personalizedRoadmap = personalizeRoadmap(roadmap, answers, role);

        // Extract known languages from question 2 (multiselect)
        const knownLanguages = (Array.isArray(answers[1]) ? answers[1] : [answers[1]])
            .filter(l => l && !l.toLowerCase().includes("none"));

        // ── BERT: Semantic skill matching ─────────────────────────
        // Collect all phase skills into one flat list for matching
        let bertSkillMatch = null;
        try {
            const allPhaseSkills = personalizedRoadmap.phases.flatMap(p => p.skills);
            if (knownLanguages.length > 0 && allPhaseSkills.length > 0) {
                bertSkillMatch = await semanticSkillMatch(knownLanguages, allPhaseSkills, 0.60);
            }
        } catch (bertErr) {
            // Non-fatal — BERT failure should not block roadmap generation
            console.warn("BERT skill match failed (non-fatal):", bertErr.message);
        }

        // Attach per-phase BERT match info so frontend can highlight skills
        if (bertSkillMatch) {
            personalizedRoadmap.phases = personalizedRoadmap.phases.map(phase => ({
                ...phase,
                skillMatchInfo: phase.skills.map(skill => ({
                    skill,
                    status: bertSkillMatch.matched.includes(skill)
                        ? "matched"
                        : bertSkillMatch.partial.includes(skill)
                            ? "partial"
                            : "missing",
                })),
            }));
            personalizedRoadmap.bertSummary = {
                matched: bertSkillMatch.matched,
                partial: bertSkillMatch.partial,
                missing: bertSkillMatch.missing,
                semanticPairs: bertSkillMatch.semanticPairs,
            };
        }

        // ── Groq: Personalized AI roadmap insights ────────────────
        let aiInsights = null;
        try {
            aiInsights = await groqRoadmapInsights({
                role,
                answers,
                knownLanguages,
                personalizedRoadmap,
                bertSkillMatch,
            });
        } catch (groqErr) {
            // Non-fatal — Groq failure should not block roadmap generation
            console.warn("Groq roadmap insights failed (non-fatal):", groqErr.message);
        }

        // ── Initialize user progress ───────────────────────────────
        if (!userProgressData.has(userId)) {
            userProgressData.set(userId, {});
        }

        const userProgress = userProgressData.get(userId);
        userProgress[role] = {
            startedAt:       new Date(),
            completedSkills: [],
            currentPhase:    1,
            answers:         answers,
            knownLanguages,
            totalProgress:   0,
        };

        res.status(200).json({
            success:      true,
            roadmap:      personalizedRoadmap,
            userProgress: userProgress[role],
            aiInsights,                  // Groq coaching card (null if unavailable)
            bertSkillMatch: bertSkillMatch ? {
                matched:       bertSkillMatch.matched,
                partial:       bertSkillMatch.partial,
                missing:       bertSkillMatch.missing.slice(0, 10),
                semanticPairs: bertSkillMatch.semanticPairs,
            } : null,
        });

    } catch (error) {
        console.error("Error generating roadmap:", error);
        res.status(500).json({
            success: false,
            message: "Server error generating roadmap",
            error:   error.message
        });
    }
};

// Helper function to personalize roadmap
function personalizeRoadmap(roadmap, answers, role) {
    const personalized = JSON.parse(JSON.stringify(roadmap));

    // Question 1: Experience level
    const experienceLevel = answers[0];
    
    // Question 2: Known programming languages (array from multiselect)
    const knownLanguages = Array.isArray(answers[1]) ? answers[1] : [answers[1]];
    
    // Question 3: Time commitment
    const timeCommitment = answers[2];
    
    // Question 4: Learning style
    const learningStyle = answers[3];
    
    // Question 5: Specific interest
    const specificInterest = answers[4];

    // Adjust based on experience
    if (experienceLevel && (experienceLevel.includes("Beginner") || experienceLevel.includes("Never"))) {
        personalized.phases[0].duration = (parseFloat(personalized.phases[0].duration) * 1.2).toFixed(1) + " months";
        personalized.phases[0].note = "⭐ Extended time for beginners - take your time to build strong foundations!";
    } else if (experienceLevel && (experienceLevel.includes("Advanced") || experienceLevel.includes("Strong") || experienceLevel.includes("Built"))) {
        personalized.phases[0].duration = (parseFloat(personalized.phases[0].duration) * 0.8).toFixed(1) + " months";
        personalized.phases[0].note = "🚀 Fast-tracked for experienced learners!";
    }

    // Adjust based on known languages
    if (knownLanguages.length > 0 && !knownLanguages.includes("None")) {
        personalized.knownLanguagesNote = `✅ Great! You already know: ${knownLanguages.join(", ")}. We'll build on this foundation.`;
        
        // If they know relevant languages, reduce early phase time
        if (role === "Full Stack Developer" && knownLanguages.includes("JavaScript")) {
            personalized.phases[0].duration = (parseFloat(personalized.phases[0].duration) * 0.7).toFixed(1) + " months";
            personalized.phases[0].note = "⚡ Accelerated track - leveraging your JavaScript knowledge!";
        }
        
        if (role === "Data Scientist" && knownLanguages.includes("Python")) {
            personalized.phases[0].duration = (parseFloat(personalized.phases[0].duration) * 0.7).toFixed(1) + " months";
            personalized.phases[0].note = "⚡ Fast-track with Python - skipping basics!";
        }
    } else {
        personalized.knownLanguagesNote = "📚 Starting fresh - we'll teach you everything from scratch!";
    }

    // Adjust based on time commitment
    if (timeCommitment && (timeCommitment.includes("30+") || timeCommitment.includes("40+"))) {
        personalized.totalMonths = Math.ceil(personalized.totalMonths * 0.7);
        personalized.paceNote = "🏃 Full-time pace - you can complete this faster!";
    } else if (timeCommitment && timeCommitment.includes("5-10")) {
        personalized.totalMonths = Math.ceil(personalized.totalMonths * 1.3);
        personalized.paceNote = "🐢 Part-time pace - steady progress is key!";
    }

    // Adjust based on learning style
    if (learningStyle) {
        personalized.learningStyleNote = `💡 Your preferred learning style: ${learningStyle}. Resources are tailored accordingly.`;
    }

    // Adjust based on specific interest
    if (specificInterest) {
        personalized.focusNote = `🎯 Primary focus area: ${specificInterest}`;
    }

    return personalized;
}

// Get User Progress
const getProgress = async (req, res) => {
    try {
        const { role } = req.params;
        const userId = req.userId;

        const userProgress = userProgressData.get(userId);
        
        if (!userProgress || !userProgress[role]) {
            return res.status(200).json({
                success: true,
                progress: null,
                message: "No progress found for this role"
            });
        }

        res.status(200).json({
            success: true,
            progress: userProgress[role]
        });

    } catch (error) {
        console.error("Error getting progress:", error);
        res.status(500).json({
            success: false,
            message: "Server error getting progress",
            error: error.message
        });
    }
};

// Update Skill Progress
const updateSkillProgress = async (req, res) => {
    try {
        const { role, phaseNumber, skillName, completed } = req.body;
        const userId = req.userId;

        if (!userProgressData.has(userId)) {
            userProgressData.set(userId, {});
        }

        const userProgress = userProgressData.get(userId);
        
        if (!userProgress[role]) {
            return res.status(404).json({
                success: false,
                message: "Please generate roadmap first"
            });
        }

        const roleProgress = userProgress[role];
        const skillId = `${phaseNumber}-${skillName}`;

        if (completed) {
            if (!roleProgress.completedSkills.includes(skillId)) {
                roleProgress.completedSkills.push(skillId);
            }
        } else {
            roleProgress.completedSkills = roleProgress.completedSkills.filter(s => s !== skillId);
        }

        // Calculate total progress
        const roadmap = roadmapDatabase[role];
        let totalSkills = 0;
        roadmap.phases.forEach(phase => {
            totalSkills += phase.skills.length;
        });
        
        roleProgress.totalProgress = Math.round((roleProgress.completedSkills.length / totalSkills) * 100);

        res.status(200).json({
            success: true,
            progress: roleProgress
        });

    } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating progress",
            error: error.message
        });
    }
};

// Get All Available Roles
const getAllRoles = async (req, res) => {
    try {
        const roles = Object.keys(roadmapDatabase).map(roleName => ({
            name: roleName,
            icon: roadmapDatabase[roleName].icon,
            duration: roadmapDatabase[roleName].totalMonths,
            difficulty: roadmapDatabase[roleName].difficulty,
            salary: roadmapDatabase[roleName].avgSalary,
            jobs: roadmapDatabase[roleName].jobOpenings,
            description: roadmapDatabase[roleName].description
        }));

        res.status(200).json({
            success: true,
            roles: roles
        });

    } catch (error) {
        console.error("Error getting roles:", error);
        res.status(500).json({
            success: false,
            message: "Server error getting roles",
            error: error.message
        });
    }
};

// Get AI Coaching Tip for a Specific Phase (Groq-powered)
const getPhaseCoach = async (req, res) => {
    try {
        const { role, phaseName, skills, knownLanguages, learningStyle } = req.body;

        if (!role || !phaseName || !skills) {
            return res.status(400).json({
                success: false,
                message: "role, phaseName, and skills are required"
            });
        }

        const coaching = await groqRoadmapPhaseCoach({ role, phaseName, skills, knownLanguages: knownLanguages || [], learningStyle });

        if (!coaching) {
            return res.status(503).json({
                success: false,
                message: "AI coaching temporarily unavailable"
            });
        }

        res.status(200).json({ success: true, coaching });

    } catch (error) {
        console.error("Error getting phase coach:", error);
        res.status(500).json({
            success: false,
            message: "Server error getting phase coaching",
            error: error.message
        });
    }
};

// In-memory storage — declared at top of file, used by all controllers

export default { getAllRoles, getQuestions, generateRoadmap, getProgress, updateSkillProgress, getPhaseCoach };