import fs from "fs";
import mammoth from "mammoth";
// pdf-parse loaded lazily inside extractPDF
import User from "../models/User.js";  // ✅ ADDED - Import User model

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

// PDF EXTRACTION — uses pdfHelper.cjs (absolute path via new URL)
async function extractPDF(filePath) {
    const { fileURLToPath } = await import("url");
    const { createRequire }  = await import("module");
    const helperPath = fileURLToPath(new URL("./pdfHelper.cjs", import.meta.url));
    const _require   = createRequire(import.meta.url);
    let parseFn;
    try {
        parseFn = _require(helperPath);
    } catch(e) {
        throw new Error("Cannot load pdfHelper.cjs: " + e.message + " | path: " + helperPath);
    }
    if (typeof parseFn !== "function") throw new Error("pdfHelper.cjs did not export a function.");
    const { readFileSync } = await import("fs");
    const data = await parseFn(readFileSync(filePath));
    return data.text;
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

// ==================== CAREER INSIGHTS CONTROLLER ====================
// No file upload required — works from role + experience + location + skills
// Integrates Groq AI coaching + BERT semantic skill gap analysis

import { groqCareerInsights } from '../services/groqService.js';
import { semanticSkillMatch  } from '../services/bertService.js';

// Role → required skills map for BERT matching
const ROLE_REQUIRED_SKILLS = {
    'software-engineer':     ['JavaScript', 'Python', 'Data Structures', 'Algorithms', 'Git', 'REST API', 'SQL', 'Docker'],
    'full-stack-developer':  ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'REST API', 'Git', 'Docker', 'PostgreSQL'],
    'frontend-developer':    ['React', 'TypeScript', 'CSS3', 'HTML5', 'Tailwind', 'Redux', 'Webpack', 'Jest'],
    'backend-developer':     ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'GraphQL', 'Docker', 'Redis', 'Microservices'],
    'devops-engineer':       ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Linux', 'Prometheus', 'Ansible'],
    'data-scientist':        ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'SQL', 'Matplotlib', 'Machine Learning'],
    'ml-engineer':           ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Docker', 'Kubernetes', 'BERT', 'Transformers'],
    'product-manager':       ['Agile', 'Scrum', 'Jira', 'Figma', 'SQL', 'Analytics', 'Product Roadmap', 'Stakeholder Management'],
    'ui-ux-designer':        ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'UI/UX', 'User Research', 'CSS3', 'Design Systems'],
    'cloud-architect':       ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Microservices', 'Security', 'Networking'],
    'mobile-developer':      ['React Native', 'Flutter', 'TypeScript', 'Firebase', 'REST API', 'Git', 'iOS', 'Android'],
};

// Salary data per role (INR, approximate 2024 India market)
const SALARY_DB = {
    'software-engineer':    { minimum: 500000,  average: 1200000, maximum: 2500000 },
    'full-stack-developer': { minimum: 600000,  average: 1400000, maximum: 2800000 },
    'frontend-developer':   { minimum: 450000,  average: 1000000, maximum: 2000000 },
    'backend-developer':    { minimum: 550000,  average: 1300000, maximum: 2600000 },
    'devops-engineer':      { minimum: 700000,  average: 1600000, maximum: 3200000 },
    'data-scientist':       { minimum: 700000,  average: 1700000, maximum: 3500000 },
    'ml-engineer':          { minimum: 800000,  average: 2000000, maximum: 4000000 },
    'product-manager':      { minimum: 800000,  average: 1800000, maximum: 3800000 },
    'ui-ux-designer':       { minimum: 400000,  average: 900000,  maximum: 1800000 },
    'cloud-architect':      { minimum: 1200000, average: 2500000, maximum: 5000000 },
    'mobile-developer':     { minimum: 500000,  average: 1200000, maximum: 2400000 },
};

// Top skills per role
const TOP_SKILLS_DB = {
    'software-engineer':    [{ name:'JavaScript', demand:92 },{ name:'Python', demand:88 },{ name:'React', demand:82 },{ name:'Docker', demand:76 },{ name:'SQL', demand:74 },{ name:'AWS', demand:70 }],
    'full-stack-developer': [{ name:'React', demand:94 },{ name:'Node.js', demand:91 },{ name:'TypeScript', demand:86 },{ name:'MongoDB', demand:78 },{ name:'Docker', demand:74 },{ name:'AWS', demand:68 }],
    'frontend-developer':   [{ name:'React', demand:96 },{ name:'TypeScript', demand:88 },{ name:'Tailwind', demand:82 },{ name:'Next.js', demand:78 },{ name:'Testing', demand:66 },{ name:'GraphQL', demand:58 }],
    'backend-developer':    [{ name:'Node.js', demand:90 },{ name:'Python', demand:88 },{ name:'PostgreSQL', demand:84 },{ name:'Docker', demand:80 },{ name:'Redis', demand:74 },{ name:'GraphQL', demand:68 }],
    'devops-engineer':      [{ name:'Kubernetes', demand:94 },{ name:'Docker', demand:92 },{ name:'Terraform', demand:86 },{ name:'AWS', demand:84 },{ name:'CI/CD', demand:82 },{ name:'Linux', demand:78 }],
    'data-scientist':       [{ name:'Python', demand:97 },{ name:'Machine Learning', demand:92 },{ name:'TensorFlow', demand:84 },{ name:'SQL', demand:80 },{ name:'Pandas', demand:78 },{ name:'Deep Learning', demand:72 }],
    'ml-engineer':          [{ name:'Python', demand:97 },{ name:'PyTorch', demand:90 },{ name:'MLOps', demand:86 },{ name:'Docker', demand:82 },{ name:'Transformers', demand:78 },{ name:'Kubernetes', demand:74 }],
    'product-manager':      [{ name:'Agile', demand:90 },{ name:'Jira', demand:85 },{ name:'Analytics', demand:82 },{ name:'Figma', demand:76 },{ name:'SQL', demand:68 },{ name:'Roadmapping', demand:64 }],
    'ui-ux-designer':       [{ name:'Figma', demand:97 },{ name:'Prototyping', demand:88 },{ name:'User Research', demand:82 },{ name:'Design Systems', demand:76 },{ name:'Adobe XD', demand:68 },{ name:'CSS3', demand:62 }],
    'cloud-architect':      [{ name:'AWS', demand:94 },{ name:'Terraform', demand:90 },{ name:'Kubernetes', demand:86 },{ name:'Security', demand:82 },{ name:'GCP', demand:74 },{ name:'Microservices', demand:70 }],
    'mobile-developer':     [{ name:'React Native', demand:88 },{ name:'Flutter', demand:86 },{ name:'TypeScript', demand:80 },{ name:'Firebase', demand:76 },{ name:'iOS', demand:68 },{ name:'Android', demand:66 }],
};

const GROWTH_DB = {
    'ml-engineer': 42, 'data-scientist': 38, 'devops-engineer': 32, 'cloud-architect': 30,
    'full-stack-developer': 28, 'backend-developer': 25, 'frontend-developer': 22,
    'software-engineer': 20, 'mobile-developer': 24, 'product-manager': 18, 'ui-ux-designer': 15,
};

// Location salary multipliers
const LOCATION_MULTIPLIER = { bangalore: 1.2, mumbai: 1.1, delhi: 1.05, hyderabad: 1.1, pune: 1.0, chennai: 1.0, kolkata: 0.85 };

export const careerInsightsController = async (req, res) => {
    try {
        const { role, experience, location, skills: rawSkills } = req.body;

        if (!role || !experience || !location) {
            return res.status(400).json({ success: false, message: 'role, experience, and location are required' });
        }

        // Parse inputs
        const expMatch   = String(experience).match(/(\d+)/);
        const expYears   = expMatch ? parseInt(expMatch[1]) : 0;
        const locKey     = location.toLowerCase();
        const multiplier = LOCATION_MULTIPLIER[locKey] || 1.0;
        let userSkills = rawSkills
            ? rawSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];

        // ── DB fallback: if no skills typed, use skills from latest resume ────
        if (userSkills.length === 0 && req.userId) {
            try {
                const User = (await import('../models/User.js')).default;
                const user = await User.findById(req.userId).select('skills resume').lean();
                if (user?.skills?.length) {
                    userSkills = user.skills.slice(0, 20);
                    console.log('📋 Using resume skills from DB:', userSkills.length, 'skills');
                } else if (user?.resume?.skills?.length) {
                    userSkills = user.resume.skills.slice(0, 20);
                    console.log('📋 Using resume.skills from DB:', userSkills.length, 'skills');
                }
            } catch (dbErr) {
                console.warn('DB skills fallback failed (non-fatal):', dbErr.message);
            }
        }

        // Salary data (adjusted for location)
        const baseSalary = SALARY_DB[role] || SALARY_DB['software-engineer'];
        const salaryData = {
            minimum: Math.round(baseSalary.minimum * multiplier),
            average: Math.round(baseSalary.average * multiplier),
            maximum: Math.round(baseSalary.maximum * multiplier),
        };

        // Experience-adjusted salary
        const expMultiplier = expYears <= 1 ? 0.45 : expYears <= 3 ? 0.7 : expYears <= 6 ? 1.0 : expYears <= 10 ? 1.4 : 1.7;
        salaryData.forYourExperience = Math.round(salaryData.average * expMultiplier);

        const topSkills    = TOP_SKILLS_DB[role]  || TOP_SKILLS_DB['software-engineer'];
        const growthRate   = GROWTH_DB[role] || 20;
        const requiredSkills = ROLE_REQUIRED_SKILLS[role] || [];

        // ── BERT: Semantic skill gap ──────────────────────────────
        let bertSkillGap = null;
        if (userSkills.length > 0 && requiredSkills.length > 0) {
            try {
                bertSkillGap = await semanticSkillMatch(userSkills, requiredSkills, 0.60);
            } catch (bertErr) {
                console.warn('BERT skill gap failed (non-fatal):', bertErr.message);
            }
        }

        // ── Groq: AI career insights ──────────────────────────────
        let aiInsights = null;
        try {
            aiInsights = await groqCareerInsights({
                role: role.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                experienceYears: expYears,
                location,
                skills: userSkills,
                salaryData,
                topSkills,
                bertSkillGap,
            });
        } catch (groqErr) {
            console.warn('Groq career insights failed (non-fatal):', groqErr.message);
        }

        // Build response
        return res.json({
            success:       true,
            role,
            location,
            skillsSource:  rawSkills ? 'user_input' : (userSkills.length ? 'resume_db' : 'none'),
            skillsUsed:    userSkills,
            salaryEstimate: salaryData,
            growthPotential: growthRate,
            marketDemand:   growthRate >= 30 ? 'Very High' : growthRate >= 20 ? 'High' : 'Medium',
            topSkills,
            requiredSkills,
            insights: [
                { icon: '📈', text: `${role.replace(/-/g, ' ')} market growing at ${growthRate}% YoY in India` },
                { icon: '💰', text: `${location} salary range: ₹${Math.round(salaryData.minimum/100000)}L – ₹${Math.round(salaryData.maximum/100000)}L` },
                { icon: '🎯', text: `${expYears} years exp → estimated ₹${Math.round(salaryData.forYourExperience/100000)}L in ${location}` },
                { icon: '🌐', text: `Bangalore and Hyderabad offer 10-20% higher packages for this role` },
            ],
            bertSkillGap: bertSkillGap ? {
                matched:       bertSkillGap.matched,
                partial:       bertSkillGap.partial,
                missing:       bertSkillGap.missing.slice(0, 8),
                semanticPairs: bertSkillGap.semanticPairs,
            } : null,
            aiInsights,
        });

    } catch (error) {
        console.error('careerInsightsController error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

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