// =============================================
// NLP Controller - COMPLETE FIX
// Fixed: Activity tracking, Groq integration, error handling
// =============================================

import fs from "fs";
import { groqNLPAnalysis } from "../services/groqService.js";
import mammoth from "mammoth";
import User from "../models/User.js";

// ==================== SKILL DATABASE ====================
const TECH_SKILLS = {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'Dart', 'R'],
    frontend: ['React', 'Angular', 'Vue', 'Next.js', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind', 'Redux', 'Material UI', 'Webpack', 'Vite'],
    backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'NestJS', 'GraphQL', 'REST API', 'FastAPI'],
    databases: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch'],
    cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'CI/CD'],
    datascience: ['Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Data Analysis', 'Scikit-learn']
};

const ALL_SKILLS = Object.values(TECH_SKILLS).flat();

// ==================== PDF EXTRACTION (FIXED) ====================
async function extractTextFromPDF(filePath) {
    try {
        const buf = fs.readFileSync(filePath);
        
        let getDocument, GlobalWorkerOptions;
        try {
            ({ getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs"));
        } catch (_) {
            try {
                ({ getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/build/pdf.mjs"));
            } catch (__) {
                throw new Error("pdfjs-dist unavailable. Run: npm install pdfjs-dist");
            }
        }

        GlobalWorkerOptions.workerSrc = "";

        const pdf = await getDocument({
            data: new Uint8Array(buf),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;
        
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(x => x.str || "").join(" ") + "\n";
        }
        
        const clean = text.replace(/\s/g, "");
        if (clean.length > 50 && (clean.match(/[\x20-\x7E]/g) || []).length / clean.length < 0.5) {
            throw new Error("PDF appears scanned/image-based. Please upload as DOCX or use OCR.");
        }
        
        return text.replace(/\s+/g, " ").trim();
    } catch (error) {
        console.error('PDF extraction error:', error.message);
        throw error;
    }
}

async function extractTextFromFile(file) {
    const filePath = file.path;
    const fileExtension = file.originalname.split('.').pop().toLowerCase();

    try {
        let text = '';
        
        if (fileExtension === 'pdf') {
            text = await extractTextFromPDF(filePath);
        } else if (fileExtension === 'docx' || fileExtension === 'doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (fileExtension === 'txt' || fileExtension === 'rtf') {
            text = fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error('Unsupported file format: ' + fileExtension);
        }

        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length < 50) {
            throw new Error('Resume too short or could not extract text');
        }
        
        return text;
        
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

// ==================== NLP FUNCTIONS ====================
function extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundSkills = new Set();
    const skillDetails = [];

    ALL_SKILLS.forEach(skill => {
        const skillLower = skill.toLowerCase();
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

        if (regex.test(textLower)) {
            foundSkills.add(skill);
            skillDetails.push({
                skill,
                category: getCategoryForSkill(skill),
                proficiency: 'Detected'
            });
        }
    });

    return { skills: Array.from(foundSkills), detailedSkills: skillDetails };
}

function getCategoryForSkill(skill) {
    for (const [category, skills] of Object.entries(TECH_SKILLS)) {
        if (skills.includes(skill)) return category;
    }
    return 'other';
}

function extractExperience(text) {
    const match = text.match(/(\d+\.?\d*)\+?\s*years?\s+(?:of\s+)?experience/i);
    if (match) {
        return { text: match[0], years: parseFloat(match[1]), confidence: 'high' };
    }
    return { text: 'Not mentioned', years: 0, confidence: 'low' };
}

function calculateATSScore(text, skills) {
    let score = 0;
    const textLower = text.toLowerCase();
    
    if (textLower.includes('experience')) score += 10;
    if (textLower.includes('education')) score += 10;
    if (textLower.includes('skills')) score += 10;
    score += Math.min(40, skills.length * 2);
    if (/@/.test(text)) score += 10;
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 10;
    if (text.length > 500) score += 10;

    return Math.min(100, Math.round(score));
}

function groupSkillsByCategory(detailedSkills) {
    const grouped = {};
    detailedSkills.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push({ skill: item.skill, proficiency: item.proficiency });
    });
    return grouped;
}

// ==================== MAIN CONTROLLER (FIXED) ====================
export const analyzeResumeNLP = async (req, res) => {
    const uploadId = `nlp_${Date.now()}`;
    
    console.log('\n📊 NLP ANALYSIS STARTED');
    console.log('User ID:', req.userId);
    console.log('Time:', new Date().toISOString());
    
    try {
        if (!req.file) {
            console.error('❌ No file uploaded');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        console.log('📄 File:', req.file.originalname, `(${req.file.size} bytes)`);
        const startTime = Date.now();

        // Extract text
        const resumeText = await extractTextFromFile(req.file);
        console.log('✅ Text extracted:', resumeText.length, 'characters');
        
        if (resumeText.length < 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Resume too short or could not extract text' 
            });
        }

        const jobDescription = req.body.jobDescription || null;

        // ── Groq NLP analysis (primary) ───────────────────
        let groqResult = null;
        try {
            console.log('🤖 Calling Groq AI for analysis...');
            groqResult = await groqNLPAnalysis(resumeText, jobDescription);
            if (groqResult) {
                console.log('✅ Groq analysis complete');
            }
        } catch (groqError) {
            console.warn('⚠️ Groq analysis failed:', groqError.message);
        }

        // ── Rule-based fallback ─────────────────────────────
        const skillsData = extractSkills(resumeText);
        const experience = extractExperience(resumeText);
        const atsScore = calculateATSScore(resumeText, skillsData.skills);
        
        console.log('✅ Skills found:', skillsData.skills.length);
        console.log('✅ Experience:', experience.years, 'years');
        console.log('✅ ATS Score:', atsScore);

        // ── Merge Groq + rule-based ──────────────────────────
        const finalSkills = groqResult?.skills?.length > skillsData.skills.length
            ? groqResult.skills
            : skillsData.skills;

        let overallScore = groqResult?.overallScore || Math.min(100, Math.round(
            Math.min(40, skillsData.skills.length * 2) +
            Math.min(30, experience.years * 5) +
            (atsScore * 0.2)
        ));

        const processingTime = Date.now() - startTime;

        // ✅ UPDATE USER WITH RESUME TRACKING - FIXED
        if (req.userId) {
            try {
                const user = await User.findById(req.userId);
                if (user) {
                    console.log('✅ User found:', user.email);

                    // Increment resume count
                    user.resumeCount = (user.resumeCount || 0) + 1;
                    console.log('📊 Resume count will be:', user.resumeCount);

                    // Add to resume history
                    if (!user.resumeHistory) user.resumeHistory = [];
                    user.resumeHistory.push({
                        filename: req.file.originalname,
                        uploadDate: new Date(),
                        skills: finalSkills.length,
                        atsScore,
                        uploadId,
                        source: 'nlp-analyzer'
                    });
                    if (user.resumeHistory.length > 50) {
                        user.resumeHistory = user.resumeHistory.slice(-50);
                    }
                    console.log('📚 Resume history length:', user.resumeHistory.length);

                    // ✅ FIXED: Changed type to 'resume_upload' to match history.js icon mapping
                    if (!user.activityHistory) user.activityHistory = [];
                    user.activityHistory.push({
                        type: 'resume_upload',  // ✅ FIXED from 'nlp_analysis' to 'resume_upload'
                        title: 'Resume Uploaded',
                        description: `Uploaded: ${req.file.originalname} - ${finalSkills.length} skills found`,
                        status: 'success',
                        timestamp: new Date(),
                        metadata: {
                            filename: req.file.originalname,
                            skillsCount: finalSkills.length,
                            atsScore: atsScore,
                            overallScore: overallScore,
                            analyzer: 'nlp',
                            groqPowered: !!groqResult
                        }
                    });
                    if (user.activityHistory.length > 100) {
                        user.activityHistory = user.activityHistory.slice(-100);
                    }
                    console.log('📋 Activity history length:', user.activityHistory.length);

                    console.log('💾 Saving to database...');
                    await user.save();
                    console.log('✅ Database updated successfully!');
                    console.log(`   - Resume count: ${user.resumeCount}`);
                    console.log(`   - Resume history: ${user.resumeHistory.length} items`);
                    console.log(`   - Activity history: ${user.activityHistory.length} items`);
                }
            } catch (dbError) {
                console.error('⚠️ DB error:', dbError.message);
                console.error('   Stack:', dbError.stack);
            }
        }

        const analysis = {
            overallScore,
            skills: finalSkills,
            skillsByCategory: groqResult?.skillsByCategory || groupSkillsByCategory(skillsData.detailedSkills),
            detailedSkills: skillsData.detailedSkills,
            experience: experience.text,
            experienceYears: groqResult?.experienceYears || experience.years,
            atsScore: groqResult?.atsScore || atsScore,
            atsLevel: atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Fair',
            recommendations: groqResult?.recommendations?.length ? groqResult.recommendations : [],
            insights: groqResult?.insights || [],
            improvements: groqResult?.improvements || [],
            keyPhrases: groqResult?.keyPhrases || [],
            writingQuality: groqResult?.writingQuality || 'average',
            sentiment: groqResult?.sentiment || 'neutral',
            groqPowered: !!groqResult,
            processingTime: `${processingTime}ms`,
            uploadId
        };

        if (groqResult?.jobMatch) {
            analysis.jobMatch = groqResult.jobMatch;
        }

        console.log('✅ NLP ANALYSIS COMPLETE');
        return res.json({ success: true, analysis });

    } catch (error) {
        console.error('❌ NLP Analysis Error:', error.message);
        console.error('   Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Analysis failed: ' + error.message,
            error: error.message
        });
    }
};