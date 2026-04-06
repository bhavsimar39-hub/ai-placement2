import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";
import User from "../models/User.js";

// ── CJS require for pdf-parse ────────────────────────────────────────────────
const _require = createRequire(import.meta.url);
let pdfParse = null;
try {
    const mod = _require("pdf-parse");
    pdfParse = typeof mod === "function" ? mod : (mod?.default || null);
    if (typeof pdfParse !== "function") pdfParse = null;
} catch (e) {
    console.warn("⚠  pdf-parse not found:", e.message);
}

// ==================== COMPREHENSIVE SKILL DATABASE (350+ SKILLS) ====================
const TECH_SKILLS = {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'R', 'MATLAB', 'Dart', 'Perl', 'Objective-C', 'Shell', 'Bash', 'PowerShell', 'Haskell', 'Erlang', 'Elixir', 'Clojure', 'F#', 'VB.NET', 'Groovy', 'Lua', 'Julia', 'Solidity'],
    frontend: ['React', 'Angular', 'Vue', 'Next.js', 'Nuxt', 'Svelte', 'SvelteKit', 'Solid', 'Qwik', 'HTML5', 'CSS3', 'SASS', 'SCSS', 'LESS', 'Tailwind', 'Bootstrap', 'Material-UI', 'Ant Design', 'Chakra UI', 'Redux', 'MobX', 'Zustand', 'Recoil', 'jQuery', 'Webpack', 'Vite', 'Rollup', 'Parcel', 'Babel', 'ESLint', 'Prettier', 'Styled Components', 'Emotion', 'CSS Modules'],
    backend: ['Node.js', 'Express', 'Fastify', 'Koa', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring MVC', 'Laravel', 'Symfony', 'Ruby on Rails', 'ASP.NET Core', 'GraphQL', 'REST API', 'gRPC', 'SOAP', 'WebSocket', 'Microservices', 'Serverless', 'Lambda'],
    databases: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Cassandra', 'DynamoDB', 'Oracle', 'SQL Server', 'Firebase', 'Elasticsearch', 'MariaDB', 'SQLite', 'Neo4j', 'CouchDB', 'InfluxDB', 'Prisma', 'TypeORM', 'Sequelize', 'Mongoose', 'SQL', 'NoSQL'],
    cloud: ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible', 'CloudFormation', 'EC2', 'S3', 'Lambda', 'ECS', 'EKS', 'Azure DevOps', 'Cloud Run', 'Nginx', 'Apache', 'Prometheus', 'Grafana', 'ELK'],
    dataScience: ['Machine Learning', 'Deep Learning', 'AI', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'XGBoost', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Big Data', 'Hadoop', 'Spark', 'Kafka', 'Tableau', 'Power BI', 'NLP', 'Computer Vision', 'OpenCV', 'Transformers', 'BERT', 'GPT', 'LLM'],
    mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'SwiftUI', 'Jetpack Compose', 'Xamarin', 'Ionic', 'Expo'],
    testing: ['Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer', 'JUnit', 'PyTest', 'Postman', 'TDD', 'BDD'],
    tools: ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'Linux', 'Unix', 'VSCode', 'IntelliJ'],
    design: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI/UX', 'Wireframing', 'Prototyping'],
    security: ['Cybersecurity', 'OAuth', 'JWT', 'SSL', 'TLS', 'Encryption', 'OWASP', 'Penetration Testing'],
    blockchain: ['Blockchain', 'Web3', 'Ethereum', 'Solidity', 'Smart Contracts', 'DeFi', 'NFT']
};

const ALL_SKILLS = Object.values(TECH_SKILLS).flat();

// PDF EXTRACTION — pdf-parse first, pdfjs-dist fallback (no workerSrc needed)
async function extractPDF(filePath) {
    const buf = fs.readFileSync(filePath);

    // ── Strategy 1: pdf-parse (module-level, most reliable in Node ESM) ──
    if (pdfParse) {
        try {
            const data = await pdfParse(buf);
            if (data && data.text && data.text.trim().length > 30) {
                console.log("✅ PDF extracted via pdf-parse —", data.text.trim().length, "chars");
                return data.text.replace(/\s+/g, " ").trim();
            }
        } catch (e) {
            console.warn("⚠  pdf-parse error:", e.message);
        }
    }

    // ── Strategy 2: pdfjs-dist (no workerSrc — use flags to disable worker) ──
    let getDocument, GlobalWorkerOptions;
    for (const mod of ["pdfjs-dist/legacy/build/pdf.mjs", "pdfjs-dist/build/pdf.mjs"]) {
        try {
            const m = await import(mod);
            getDocument         = m.getDocument         || m.default?.getDocument;
            GlobalWorkerOptions = m.GlobalWorkerOptions || m.default?.GlobalWorkerOptions;
            if (getDocument && GlobalWorkerOptions) break;
        } catch (_) { continue; }
    }

    if (getDocument && GlobalWorkerOptions) {
        try {
            // Do NOT set workerSrc — disableRange+disableStream+useWorkerFetch:false
            // tells pdfjs to run synchronously without any worker thread
            const pdf = await getDocument({
                data:            new Uint8Array(buf),
                useWorkerFetch:  false,
                isEvalSupported: false,
                useSystemFonts:  true,
                disableRange:    true,
                disableStream:   true,
                disableFontFace: true,
            }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const c = await (await pdf.getPage(i)).getTextContent();
                text += c.items.map(x => x.str || "").join(" ") + "\n";
            }
            await pdf.destroy();
            const result = text.replace(/\s+/g, " ").trim();
            if (result.length > 30) {
                console.log("✅ PDF extracted via pdfjs-dist —", result.length, "chars");
                return result;
            }
        } catch (e) {
            console.warn("⚠  pdfjs-dist error:", e.message);
        }
    }

    throw new Error("Could not extract text from this PDF. Please upload as DOCX or TXT instead.");
}

async function extractText(filePath, mime, name, extractedTextFallback) {
    const n = name.toLowerCase();
    let text = '';

    if (mime === 'application/pdf' || n.endsWith('.pdf')) {
        text = await extractPDF(filePath);
    } else if (n.endsWith('.docx') || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
    } else if (n.endsWith('.doc') || mime === 'application/msword') {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } catch {
            text = fs.readFileSync(filePath, 'latin1').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        }
    } else if (n.endsWith('.txt') || mime === 'text/plain') {
        text = fs.readFileSync(filePath, 'utf8');
    } else if (/\.(jpg|jpeg|png|webp|bmp|tiff)$/i.test(n) || mime.startsWith('image/')) {
        // Image resume — use client-side extracted text passed via extractedText field
        text = extractedTextFallback || '';
        if (!text) throw new Error('Image resumes require client-side extraction. Please use the browser-based analyzer.');
    } else {
        throw new Error(`Unsupported format: ${n}. Upload PDF, DOC, DOCX, TXT, or an image.`);
    }

    if (!text || text.length < 50) throw new Error('Insufficient text extracted from file');
    return text.replace(/\s+/g, ' ').trim();
}

// SKILLS
function detectSkills(text) {
    const found = new Set();
    const byCategory = {};
    for (const [cat, skills] of Object.entries(TECH_SKILLS)) {
        byCategory[cat] = [];
        for (const skill of skills) {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                found.add(skill);
                byCategory[cat].push(skill);
            }
        }
        if (byCategory[cat].length === 0) delete byCategory[cat];
    }
    return { skills: Array.from(found), byCategory };
}

// EXPERIENCE
function calcExperience(text) {
    let max = 0;
    const matches = text.matchAll(/(\d+)\.?\d*\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi);
    for (const m of matches) max = Math.max(max, parseFloat(m[1]));
    
    const dates = text.matchAll(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi);
    let total = 0;
    for (const m of dates) {
        const start = parseInt(m[1]);
        const end = m[2].match(/\d{4}/) ? parseInt(m[2]) : new Date().getFullYear();
        if (start >= 1990 && start <= 2026) total += Math.max(0, end - start);
    }
    return Math.min(Math.max(max, total), 50);
}

// EXPERIENCE DETAILS
function extractExperience(lines) {
    const exp = [];
    let inSection = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^(experience|work|employment)/i.test(line)) inSection = true;
        if (/^(education|skills|projects)/i.test(line)) inSection = false;
        
        const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present)/i);
        const jobMatch = /\b(engineer|developer|manager|analyst|designer|consultant|lead|director)\b/i.test(line);
        
        if ((inSection || !exp.length) && (dateMatch || jobMatch) && line.length > 10) {
            exp.push({
                title: line.replace(/^\d+\.\s*/, ''),
                duration: dateMatch ? dateMatch[0] : '',
                company: extractCompany(lines[i+1] || ''),
                description: lines.slice(i+1, i+4).join(' ').substring(0, 250)
            });
        }
    }
    return exp.slice(0, 8);
}

function extractCompany(text) {
    const match = text.match(/(?:at|@)\s+([A-Z][a-zA-Z\s&.'-]+)/i);
    return match ? match[1].trim() : '';
}

// EDUCATION
function extractEducation(lines) {
    const edu = [];
    const degrees = ['phd', 'master', 'm.tech', 'mba', 'bachelor', 'b.tech', 'b.e', 'b.sc', 'diploma'];
    for (const line of lines) {
        for (const deg of degrees) {
            if (line.toLowerCase().includes(deg) && line.length > 10) {
                edu.push({
                    degree: line.trim(),
                    year: line.match(/\d{4}/)?.[0] || ''
                });
                break;
            }
        }
        if (/certif/i.test(line) && line.length > 15) {
            edu.push({ certification: line.trim(), year: line.match(/\d{4}/)?.[0] || '' });
        }
    }
    return [...new Set(edu.map(e => JSON.stringify(e)))].map(e => JSON.parse(e));
}

// ACHIEVEMENTS
function extractAchievements(lines) {
    const ach = [];
    const verbs = ['achieved', 'increased', 'reduced', 'improved', 'led', 'managed', 'built', 'created', 'launched'];
    for (const line of lines) {
        if (/\d+%|\$\d+|(\d+)\s*(million|thousand|users)/i.test(line) && line.length > 25) {
            ach.push(line.trim());
        } else {
            for (const verb of verbs) {
                if (line.toLowerCase().startsWith(verb) && line.length > 30 && ach.length < 10) {
                    ach.push(line.trim());
                    break;
                }
            }
        }
    }
    return ach.slice(0, 10);
}

// PROJECTS
function extractProjects(lines) {
    const proj = [];
    let inSection = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^projects?$/i.test(line)) inSection = true;
        if (/^(experience|education|skills)/i.test(line)) inSection = false;
        if (inSection && line.length > 15) {
            proj.push({ name: line, desc: lines[i+1] || '' });
        }
    }
    return proj.slice(0, 8);
}

// CERTIFICATIONS
function extractCertifications(lines) {
    const certs = [];
    const keywords = ['certified', 'certification', 'certificate', 'aws', 'azure', 'gcp', 'comptia', 'cisco', 'oracle'];
    for (const line of lines) {
        for (const kw of keywords) {
            if (line.toLowerCase().includes(kw) && line.length > 15 && certs.length < 10) {
                certs.push({ name: line.trim(), year: line.match(/\d{4}/)?.[0] || '' });
                break;
            }
        }
    }
    return [...new Set(certs.map(c => JSON.stringify(c)))].map(c => JSON.parse(c));
}

// LEVEL
function determineLevel(years, text, skillCount) {
    if (years >= 10 || /architect|principal|staff|fellow/i.test(text)) return 'Senior/Lead';
    if (years >= 5 || /senior|lead/i.test(text)) return 'Mid-Senior';
    if (years >= 2 || skillCount >= 10) return 'Mid-Level';
    return 'Entry-Level';
}

// SCORE
function calculateScore(years, skillCount, eduCount, achCount, certCount, projCount) {
    let score = Math.min(years * 10, 50);
    score += Math.min(skillCount * 2, 30);
    score += Math.min(eduCount * 5, 10);
    score += Math.min(achCount * 2, 10);
    score += Math.min(certCount * 3, 10);
    score += Math.min(projCount * 2, 10);
    return Math.min(Math.round(score), 100);
}

// SALARY
function estimateSalary(years, skills, level) {
    let base = 50000;
    base += years * 8000;
    if (skills.includes('Python')) base += 10000;
    if (skills.includes('React') || skills.includes('Angular')) base += 8000;
    if (skills.includes('AWS') || skills.includes('Azure')) base += 12000;
    if (skills.includes('Machine Learning') || skills.includes('AI')) base += 15000;
    if (level === 'Senior/Lead') base *= 1.3;
    else if (level === 'Mid-Senior') base *= 1.15;
    
    const min = Math.round(base * 0.85 / 1000) * 1000;
    const max = Math.round(base * 1.15 / 1000) * 1000;
    return { min, max, currency: 'USD' };
}

// INSIGHTS
function generateInsights(years, skillCount, level, skillData, certCount) {
    const insights = [];
    
    if (years >= 7) insights.push({ icon: '🌟', text: 'Highly experienced professional with strong market value' });
    else if (years >= 3) insights.push({ icon: '💼', text: 'Solid mid-level experience ready for senior roles' });
    else insights.push({ icon: '🚀', text: 'Early-career professional with growth potential' });
    
    if (skillCount >= 20) insights.push({ icon: '🎯', text: 'Exceptional technical breadth across multiple domains' });
    else if (skillCount >= 12) insights.push({ icon: '✅', text: 'Well-rounded skill set for modern development' });
    else insights.push({ icon: '📚', text: 'Focused skill set - consider broadening expertise' });
    
    if (skillData.byCategory.cloud) insights.push({ icon: '☁️', text: 'Cloud skills highly valued in current market' });
    if (skillData.byCategory.dataScience) insights.push({ icon: '🤖', text: 'AI/ML expertise opens premium opportunities' });
    if (certCount >= 3) insights.push({ icon: '🏆', text: 'Strong certification portfolio boosts credibility' });
    
    if (!skillData.byCategory.cloud) insights.push({ icon: '⚠️', text: 'Missing cloud skills - critical for career growth' });
    
    return insights.slice(0, 6);
}

// RECOMMENDATIONS
function generateRecommendations(years, skillData, edu, certs, level, skillCount) {
    const recs = [];
    
    if (skillCount < 15) {
        recs.push({ priority: 'high', text: 'Learn 5-7 new in-demand skills this quarter' });
    }
    if (!skillData.byCategory.cloud) {
        recs.push({ priority: 'high', text: 'Add cloud skills - AWS, Azure or GCP' });
    }
    if (!skillData.byCategory.dataScience && years > 3) {
        recs.push({ priority: 'medium', text: 'Learn AI/ML basics - TensorFlow, PyTorch' });
    }
    if (years < 2) {
        recs.push({ priority: 'high', text: 'Build strong GitHub portfolio with 8-10 projects' });
    }
    
    recs.push({ priority: 'low', text: 'Update LinkedIn profile and network actively' });
    recs.push({ priority: 'low', text: 'Write technical blogs to establish thought leadership' });
    
    return recs.slice(0, 10);
}

// STRENGTHS & WEAKNESSES
function analyzeProfile(skillData, years, edu, certs) {
    const strengths = [];
    const weaknesses = [];
    
    if (years >= 5) strengths.push('Strong professional experience');
    else weaknesses.push('Limited work experience');
    
    if (skillData.skills.length >= 15) strengths.push('Diverse technical skill set');
    else weaknesses.push('Limited technical breadth');
    
    if (certs.length >= 3) strengths.push('Well-credentialed professional');
    else weaknesses.push('Few industry certifications');
    
    if (edu.length >= 2) strengths.push('Strong educational background');
    
    if (skillData.byCategory.cloud) strengths.push('Cloud computing expertise');
    else weaknesses.push('No cloud platform experience');
    
    if (skillData.byCategory.dataScience) strengths.push('AI/ML knowledge');
    
    return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) };
}

// CAREER PATHS
function suggestPaths(skillData, years) {
    const paths = [];
    
    if (skillData.byCategory.dataScience) {
        paths.push({ role: 'Machine Learning Engineer', fit: 'High', demand: 'Very High' });
        paths.push({ role: 'Data Scientist', fit: 'High', demand: 'High' });
    }
    if (skillData.byCategory.cloud) {
        paths.push({ role: 'Cloud Architect', fit: years >= 5 ? 'High' : 'Medium', demand: 'Very High' });
        paths.push({ role: 'DevOps Engineer', fit: 'High', demand: 'High' });
    }
    if (skillData.byCategory.frontend) {
        paths.push({ role: 'Frontend Architect', fit: years >= 5 ? 'High' : 'Medium', demand: 'Medium' });
    }
    if (skillData.byCategory.backend) {
        paths.push({ role: 'Backend Engineer', fit: 'High', demand: 'High' });
        paths.push({ role: 'Full Stack Developer', fit: 'High', demand: 'High' });
    }
    if (years >= 8) {
        paths.push({ role: 'Engineering Manager', fit: 'High', demand: 'High' });
        paths.push({ role: 'Technical Lead', fit: 'High', demand: 'Medium' });
    }
    
    return paths.slice(0, 6);
}

// SKILL GAPS
function findGaps(skillData, level) {
    const gaps = [];
    
    if (!skillData.byCategory.cloud) gaps.push({ skill: 'Cloud (AWS/Azure)', priority: 'Critical', reason: 'Essential for modern development' });
    if (!skillData.byCategory.testing) gaps.push({ skill: 'Testing (Jest/Cypress)', priority: 'High', reason: 'Quality assurance crucial' });
    if (!skillData.byCategory.tools || !skillData.skills.includes('Docker')) gaps.push({ skill: 'Docker/Kubernetes', priority: 'High', reason: 'Container skills in demand' });
    if (level !== 'Entry-Level' && !skillData.byCategory.dataScience) gaps.push({ skill: 'AI/ML Basics', priority: 'Medium', reason: 'Future-proof your career' });
    if (!skillData.skills.includes('TypeScript') && skillData.skills.includes('JavaScript')) gaps.push({ skill: 'TypeScript', priority: 'Medium', reason: 'Industry standard for JS' });
    
    return gaps.slice(0, 6);
}

// MAIN CONTROLLER - UPDATED WITH ACTIVITY TRACKING
export const analyzeCareerDNAController = async (req, res) => {
    try {
        const userId = req.userId;  // ✅ ADDED - Get user ID
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        
        let text;
        try {
            text = await extractText(req.file.path, req.file.mimetype, req.file.originalname, req.body?.extractedText || '');
        } catch (err) {
            fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: `Extraction failed: ${err.message}` });
        }
        
        
        const lines = text.split('\n').filter(l => l.trim().length > 5);
        const textLower = text.toLowerCase();
        
        const skillData = detectSkills(text);
        const years = calcExperience(textLower);
        const experience = extractExperience(lines);
        const education = extractEducation(lines);
        const achievements = extractAchievements(lines);
        const projects = extractProjects(lines);
        const certifications = extractCertifications(lines);
        const level = determineLevel(years, textLower, skillData.skills.length);
        const score = calculateScore(years, skillData.skills.length, education.length, achievements.length, certifications.length, projects.length);
        const salary = estimateSalary(years, skillData.skills, level);
        const insights = generateInsights(years, skillData.skills.length, level, skillData, certifications.length);
        const recommendations = generateRecommendations(years, skillData, education, certifications, level, skillData.skills.length);
        const profile = analyzeProfile(skillData, years, education, certifications);
        const paths = suggestPaths(skillData, years);
        const gaps = findGaps(skillData, level);
        
        // ✅ TRACK ACTIVITY IN DATABASE
        try {
            const user = await User.findById(userId);
            if (user) {
                if (!user.activityHistory) user.activityHistory = [];
                user.activityHistory.push({
                    type: 'career_dna',
                    title: 'Career DNA Analysis Completed',
                    description: `Analyzed: ${req.file.originalname} - ${skillData.skills.length} skills found, ${years} years experience`,
                    status: 'success',
                    timestamp: new Date(),
                    metadata: {
                        skillsCount: skillData.skills.length,
                        experienceYears: years,
                        careerLevel: level,
                        careerScore: score,
                        careerPaths: paths.length,
                        filename: req.file.originalname
                    }
                });

                // Keep last 100 activities
                if (user.activityHistory.length > 100) {
                    user.activityHistory = user.activityHistory.slice(-100);
                }

                await user.save();
            }
        } catch (dbError) {
        }
        
        fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        
        
        return res.json({
            success: true,
            analysis: {
                skills: skillData.skills,
                skillsByCategory: skillData.byCategory,
                skillCount: skillData.skills.length,
                experienceYears: years,
                experience,
                education,
                certifications,
                achievements,
                projects,
                careerLevel: level,
                careerScore: score,
                salaryEstimate: salary,
                insights,
                recommendations,
                strengths: profile.strengths,
                weaknesses: profile.weaknesses,
                careerPaths: paths,
                skillGaps: gaps,
                summary: {
                    totalSkills: skillData.skills.length,
                    totalExperience: experience.length,
                    totalEducation: education.length,
                    totalCertifications: certifications.length,
                    totalAchievements: achievements.length,
                    totalProjects: projects.length
                }
            }
        });
        
    } catch (error) {
        req.file && fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: error.message });
    }
};