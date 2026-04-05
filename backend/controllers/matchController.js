// backend/controllers/matchController.js

import User from "../models/User.js";
import { semanticSkillMatch } from "../services/bertService.js";
import { groqJobMatchInsights } from "../services/groqService.js";

// ══════════════════════════════════════════════════════
// FULL JOB DATABASE — 64 roles across 16 domains
// Synced with job-match.js frontend data
// ══════════════════════════════════════════════════════
const JOB_DATABASE = [
    // Machine Learning / AI
    { role:"Machine Learning Engineer",      domain:"machine-learning",   salary:"₹8–22 LPA",  demand:92, skills:["python","tensorflow","pytorch","mlops","docker","kubernetes","scikit-learn","numpy","pandas","deep learning"] },
    { role:"AI Researcher",                  domain:"machine-learning",   salary:"₹10–35 LPA", demand:78, skills:["python","deep learning","linear algebra","nlp","computer vision","statistics","pytorch","tensorflow","research"] },
    { role:"NLP Engineer",                   domain:"machine-learning",   salary:"₹9–24 LPA",  demand:88, skills:["python","huggingface","bert","llm","transformers","fine-tuning","nlp","spacy","nltk"] },
    { role:"Computer Vision Engineer",       domain:"machine-learning",   salary:"₹10–28 LPA", demand:85, skills:["opencv","yolo","pytorch","cnn","image segmentation","edge ai","python","deep learning","tensorflow"] },

    // Web Development
    { role:"Full Stack Developer",           domain:"web-development",    salary:"₹5–18 LPA",  demand:95, skills:["react","node.js","typescript","postgresql","docker","aws","javascript","mongodb","express","css"] },
    { role:"Frontend Developer",             domain:"web-development",    salary:"₹4–14 LPA",  demand:88, skills:["javascript","react","next.js","css","tailwind","html","typescript","redux","vue","web performance"] },
    { role:"Backend Developer",              domain:"web-development",    salary:"₹5–16 LPA",  demand:91, skills:["node.js","go","java","postgresql","redis","microservices","rest api","python","spring","express"] },
    { role:"Web Performance Engineer",       domain:"web-development",    salary:"₹8–20 LPA",  demand:76, skills:["core web vitals","cdn","webpack","browser apis","profiling","edge computing","javascript","performance"] },

    // Mobile App Development
    { role:"Android Developer",              domain:"app-development",    salary:"₹4–15 LPA",  demand:85, skills:["kotlin","jetpack compose","android","firebase","rest api","java","room db","coroutines","mvvm"] },
    { role:"iOS Developer",                  domain:"app-development",    salary:"₹6–20 LPA",  demand:74, skills:["swift","swiftui","xcode","core data","arkit","objective-c","combine","uikit","cocoapods"] },
    { role:"Flutter Developer",              domain:"app-development",    salary:"₹5–18 LPA",  demand:89, skills:["flutter","dart","firebase","bloc","riverpod","rest api","ci/cd","state management"] },
    { role:"React Native Developer",         domain:"app-development",    salary:"₹5–17 LPA",  demand:83, skills:["react native","javascript","typescript","redux","expo","native modules","react","mobile"] },

    // Cybersecurity
    { role:"Security Analyst (SOC)",         domain:"cybersecurity",      salary:"₹6–16 LPA",  demand:89, skills:["siem","splunk","incident response","networking","linux","threat intelligence","cybersecurity","security"] },
    { role:"Ethical Hacker / Pentester",     domain:"cybersecurity",      salary:"₹8–30 LPA",  demand:82, skills:["burpsuite","metasploit","python","osint","web app security","active directory","penetration testing","kali linux"] },
    { role:"Cloud Security Engineer",        domain:"cybersecurity",      salary:"₹10–25 LPA", demand:91, skills:["aws","azure","iam","zero trust","cspm","terraform","compliance","cloud","security"] },
    { role:"Malware Analyst",                domain:"cybersecurity",      salary:"₹12–35 LPA", demand:72, skills:["assembly","ida pro","ghidra","python","debugging","binary analysis","reverse engineering","security"] },

    // Cloud Engineering
    { role:"Cloud Engineer",                 domain:"cloud",              salary:"₹7–22 LPA",  demand:91, skills:["aws","gcp","azure","terraform","linux","networking","python","kubernetes","cloud","devops"] },
    { role:"DevOps / Platform Engineer",     domain:"cloud",              salary:"₹6–20 LPA",  demand:93, skills:["docker","kubernetes","ci/cd","ansible","prometheus","gitops","jenkins","linux","python","terraform"] },
    { role:"Site Reliability Engineer",      domain:"cloud",              salary:"₹12–30 LPA", demand:86, skills:["kubernetes","go","python","observability","chaos engineering","sre","linux","monitoring","prometheus"] },
    { role:"Cloud Architect",                domain:"cloud",              salary:"₹18–45 LPA", demand:79, skills:["multi-cloud","solution architecture","cost optimization","security","migration","aws","azure","gcp"] },

    // Data Science & Analytics
    { role:"Data Scientist",                 domain:"data-science",       salary:"₹10–28 LPA", demand:87, skills:["python","r","statistics","machine learning","sql","tableau","a/b testing","pandas","numpy","scikit-learn"] },
    { role:"Data Analyst",                   domain:"data-science",       salary:"₹4–12 LPA",  demand:94, skills:["sql","excel","power bi","python","statistics","tableau","dashboard","data analysis"] },
    { role:"Data Engineer",                  domain:"data-science",       salary:"₹8–22 LPA",  demand:90, skills:["apache spark","kafka","airflow","sql","python","snowflake","dbt","etl","hadoop","bigquery"] },
    { role:"Business Intelligence Developer",domain:"data-science",       salary:"₹6–16 LPA",  demand:83, skills:["power bi","tableau","sql","ssas","data modeling","etl","dax","business intelligence"] },

    // UI/UX Design
    { role:"UI/UX Designer",                 domain:"ui-ux",              salary:"₹4–16 LPA",  demand:83, skills:["figma","prototyping","user research","design systems","accessibility","framer","sketch","ui","ux"] },
    { role:"Product Designer",               domain:"ui-ux",              salary:"₹6–22 LPA",  demand:79, skills:["design thinking","systems design","wireframing","data analysis","leadership","figma","ux","product"] },
    { role:"UX Researcher",                  domain:"ui-ux",              salary:"₹5–14 LPA",  demand:74, skills:["user interviews","usability testing","survey design","figma","data analysis","personas","research","ux"] },
    { role:"Motion & Interaction Designer",  domain:"ui-ux",              salary:"₹6–20 LPA",  demand:76, skills:["after effects","lottie","rive","principle","css animation","framer motion","motion design","animation"] },

    // Digital Marketing
    { role:"SEO / Growth Specialist",        domain:"digital-marketing",  salary:"₹3–10 LPA",  demand:80, skills:["seo","content strategy","ahrefs","technical seo","analytics","cro","google analytics","semrush"] },
    { role:"Performance Marketing Manager",  domain:"digital-marketing",  salary:"₹5–15 LPA",  demand:86, skills:["google ads","meta ads","analytics","a/b testing","attribution","budget management","facebook ads","ppc"] },
    { role:"Content Strategist",             domain:"digital-marketing",  salary:"₹4–12 LPA",  demand:77, skills:["content writing","seo","cms","analytics","brand voice","storytelling","wordpress","copywriting"] },
    { role:"Social Media Manager",           domain:"digital-marketing",  salary:"₹3–12 LPA",  demand:76, skills:["content creation","brand strategy","video editing","community management","paid social","analytics","instagram","linkedin"] },

    // Blockchain & Web3
    { role:"Blockchain Developer",           domain:"blockchain",         salary:"₹10–35 LPA", demand:84, skills:["solidity","ethereum","smart contracts","web3.js","hardhat","ipfs","blockchain","defi","truffle"] },
    { role:"Smart Contract Auditor",         domain:"blockchain",         salary:"₹15–50 LPA", demand:71, skills:["solidity","security analysis","formal verification","slither","foundry","evm","blockchain","security"] },
    { role:"Web3 Frontend Developer",        domain:"blockchain",         salary:"₹8–25 LPA",  demand:79, skills:["react","ethers.js","wagmi","walletconnect","typescript","ipfs","web3","javascript","next.js"] },
    { role:"DeFi Protocol Engineer",         domain:"blockchain",         salary:"₹18–60 LPA", demand:68, skills:["solidity","defi","mathematical finance","cryptography","foundry","economic modeling","blockchain","smart contracts"] },

    // Game Development
    { role:"Unity Developer",                domain:"game-development",   salary:"₹4–16 LPA",  demand:81, skills:["unity","c#","physics","ar/vr","shader programming","performance optimization","game development","3d"] },
    { role:"Unreal Engine Developer",        domain:"game-development",   salary:"₹8–25 LPA",  demand:74, skills:["unreal engine","c++","blueprints","vfx","level design","rendering","game development","3d"] },
    { role:"Game Designer",                  domain:"game-development",   salary:"₹4–14 LPA",  demand:72, skills:["game mechanics","level design","ux","monetization","analytics","balancing","game design","unity"] },
    { role:"AR/VR Developer",                domain:"game-development",   salary:"₹8–22 LPA",  demand:83, skills:["unity","unreal","arkit","arcore","webxr","spatial computing","3d math","shaders","ar","vr"] },

    // DevRel & Developer Advocacy
    { role:"Developer Advocate",             domain:"devrel",             salary:"₹8–22 LPA",  demand:77, skills:["public speaking","technical writing","apis","community building","demo building","video production","documentation"] },
    { role:"Technical Writer",               domain:"devrel",             salary:"₹5–16 LPA",  demand:79, skills:["technical writing","apis","markdown","docs-as-code","diagramming","developer ux","documentation","content"] },
    { role:"Community Manager (Dev)",        domain:"devrel",             salary:"₹4–12 LPA",  demand:72, skills:["community building","discord","slack","event management","content","analytics","social media","marketing"] },
    { role:"Solutions Engineer",             domain:"devrel",             salary:"₹10–25 LPA", demand:80, skills:["full stack development","apis","sales engineering","presentation","sql","integration","javascript","python"] },

    // Embedded Systems & IoT
    { role:"Embedded Systems Engineer",      domain:"embedded",           salary:"₹5–18 LPA",  demand:83, skills:["c","c++","rtos","arm","device drivers","pcb design","uart","spi","i2c","embedded","firmware"] },
    { role:"IoT Solutions Architect",        domain:"embedded",           salary:"₹8–22 LPA",  demand:85, skills:["mqtt","aws iot","edge computing","python","networking","cloud integration","iot","embedded","rtos"] },
    { role:"VLSI / Chip Design Engineer",    domain:"embedded",           salary:"₹8–30 LPA",  demand:78, skills:["verilog","vhdl","systemverilog","uvm","synthesis","dft","spice","vlsi","chip design"] },
    { role:"Robotics Software Engineer",     domain:"embedded",           salary:"₹8–25 LPA",  demand:80, skills:["ros","ros2","c++","python","computer vision","slam","motion planning","robotics","embedded"] },

    // Quantitative Finance & FinTech
    { role:"Quantitative Analyst (Quant)",   domain:"quantitative",       salary:"₹15–60 LPA", demand:72, skills:["python","r","statistics","probability","derivatives","stochastic calculus","mathematics","finance","quantitative"] },
    { role:"Algorithmic Trading Engineer",   domain:"quantitative",       salary:"₹12–45 LPA", demand:70, skills:["python","c++","low latency","market microstructure","backtesting","risk management","trading","finance"] },
    { role:"FinTech Product Engineer",       domain:"quantitative",       salary:"₹8–22 LPA",  demand:88, skills:["java","go","payment apis","pci dss","system design","high availability","distributed systems","fintech"] },
    { role:"Risk & Compliance Analyst",      domain:"quantitative",       salary:"₹6–16 LPA",  demand:81, skills:["risk modeling","sql","python","regulatory frameworks","credit analysis","statistics","finance","compliance"] },

    // Product Management
    { role:"Product Manager",                domain:"product-management", salary:"₹10–28 LPA", demand:85, skills:["roadmapping","prds","data analysis","sql","a/b testing","stakeholder management","product","agile","jira"] },
    { role:"Technical Product Manager",      domain:"product-management", salary:"₹14–35 LPA", demand:82, skills:["apis","system design","sql","engineering","product metrics","developer experience","technical","product"] },
    { role:"Growth Product Manager",         domain:"product-management", salary:"₹12–30 LPA", demand:83, skills:["growth loops","experimentation","funnel analysis","sql","behavioral psychology","retention","analytics","product"] },
    { role:"AI Product Manager",             domain:"product-management", salary:"₹15–40 LPA", demand:88, skills:["llm","product sense","prompt engineering","ethics","data analysis","roadmapping","ai","machine learning","product"] },

    // AR / VR & Spatial Computing
    { role:"XR Developer (Unity/Unreal)",    domain:"arvr",               salary:"₹8–24 LPA",  demand:82, skills:["unity","unreal","c#","c++","openxr","spatial ui","3d mathematics","ar","vr","xr"] },
    { role:"3D Technical Artist",            domain:"arvr",               salary:"₹5–16 LPA",  demand:76, skills:["blender","substance painter","shaders","lod optimization","rigging","pbr","3d","unity","unreal"] },
    { role:"Spatial UX Designer",            domain:"arvr",               salary:"₹10–28 LPA", demand:71, skills:["spatial ui","hand tracking","eye gaze","depth perception","accessibility","figma","ar","vr","ux","design"] },
    { role:"WebXR Developer",                domain:"arvr",               salary:"₹7–20 LPA",  demand:75, skills:["three.js","webxr","react","glsl","wasm","javascript","typescript","ar","vr","web"] },

    // MLOps & AI Infrastructure
    { role:"MLOps Engineer",                 domain:"mlops",              salary:"₹10–28 LPA", demand:91, skills:["mlflow","kubeflow","docker","kubernetes","python","feature stores","model registry","mlops","ci/cd","devops"] },
    { role:"AI Infrastructure Engineer",     domain:"mlops",              salary:"₹14–40 LPA", demand:86, skills:["cuda","distributed training","gpu clusters","pytorch","triton","hpc","python","c++","ai","infrastructure"] },
    { role:"Data Platform Engineer",         domain:"mlops",              salary:"₹8–22 LPA",  demand:88, skills:["apache spark","flink","kafka","dbt","lakehouse","data governance","python","sql","databricks","snowflake"] },
    { role:"LLM Engineer",                   domain:"mlops",              salary:"₹12–35 LPA", demand:95, skills:["llm","rag","fine-tuning","langchain","vector dbs","prompt engineering","rlhf","python","huggingface","transformers"] },
];

// ── Alias map for common skill name variants ──────────────────
const ALIASES = {
    "js":"javascript","ts":"typescript","node":"node.js","nodejs":"node.js",
    "reactjs":"react","react.js":"react","vuejs":"vue","vue.js":"vue",
    "nextjs":"next.js","angularjs":"angular","postgres":"postgresql",
    "mongo":"mongodb","k8s":"kubernetes","sklearn":"scikit-learn",
    "scikit":"scikit-learn","ml":"machine learning","dl":"deep learning",
    "golang":"go","cpp":"c++","csharp":"c#","dotnet":".net",
    "hugging face":"huggingface","langchain":"langchain",
    "generative ai":"ai","genai":"ai","llms":"llm","gpts":"llm",
    "bert":"bert","gpt":"llm","chatgpt":"llm",
    "rag":"rag","aws iot":"aws iot",
    "github":"git","gitlab":"git",
};

function norm(s) {
    const l = s.toLowerCase().trim();
    return ALIASES[l] || l;
}

// ── Core matching function ────────────────────────────────────
function matchJobs(userSkills) {
    const normUser = [...new Set(userSkills.map(norm))];

    return JOB_DATABASE.map(job => {
        const exact   = job.skills.filter(s => normUser.includes(s));
        const partial = job.skills.filter(s =>
            !normUser.includes(s) &&
            normUser.some(u => s.includes(u) || u.includes(s))
        );
        const missing = job.skills.filter(s =>
            !normUser.includes(s) && !partial.includes(s)
        );

        const score = Math.round(
            ((exact.length + partial.length * 0.4) / job.skills.length) * 100
        );

        return {
            ...job,
            matchScore:    score,
            matchedSkills: exact,
            partialSkills: partial,
            missingSkills: missing.slice(0, 6),
            matchedCount:  exact.length,
            totalRequired: job.skills.length,
            grade: score >= 75 ? "Strong Match"
                 : score >= 50 ? "Good Match"
                 : score >= 25 ? "Partial Match"
                 :               "Skill Gap",
        };
    })
    .filter(j => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ── Controller ────────────────────────────────────────────────
export const jobMatchController = async (req, res) => {
    try {
        const userId = req.userId;
        let skills   = req.body.skills || [];

        if (typeof skills === "string")
            skills = skills.split(",").map(s => s.trim()).filter(Boolean);

        if (!skills.length) {
            return res.status(400).json({
                success: false,
                message: "Skills array required. Send: { skills: ['React', 'Node.js'] }",
            });
        }

        const allMatched    = matchJobs(skills);

        // ── BERT semantic boost for top results ───────────────
        // Collect all unique missing skills from top 5 jobs in one
        // batch call — much more efficient than one call per job.
        let bertUsed = false;
        let semanticBoosts = [];   // { role, boostedScore, bertMatched }

        if (allMatched.length > 0 && process.env.HUGGINGFACE_API_KEY) {
            try {
                const top5        = allMatched.slice(0, 5);
                const normUser    = [...new Set(skills.map(s => (ALIASES[s.toLowerCase().trim()] || s.toLowerCase().trim())))];
                // Gather every unique missing skill across top 5 jobs
                const uniqueMiss  = [...new Set(top5.flatMap(j => j.missingSkills))];

                if (uniqueMiss.length > 0) {
                    const bertResult = await semanticSkillMatch(normUser, uniqueMiss, 0.65);
                    const semSet     = new Set(bertResult.matched);   // skills BERT found

                    if (semSet.size > 0) {
                        bertUsed = true;
                        // Apply score boost to each top-5 job
                        top5.forEach(job => {
                            const bertMatchedForJob = job.missingSkills.filter(s => semSet.has(s));
                            if (bertMatchedForJob.length > 0) {
                                const boost = Math.round(
                                    (bertMatchedForJob.length / job.totalRequired) * 100 * 0.65
                                );
                                const boostedScore = Math.min(100, job.matchScore + boost);
                                // Mutate in-place (already sliced, won't affect sort)
                                job.matchScore        = boostedScore;
                                job.grade             = boostedScore >= 75 ? "Strong Match"
                                                       : boostedScore >= 50 ? "Good Match"
                                                       : boostedScore >= 25 ? "Partial Match"
                                                       :                      "Skill Gap";
                                job.semanticMatched   = bertMatchedForJob;
                                semanticBoosts.push({
                                    role:          job.role,
                                    boostedScore,
                                    bertMatched:   bertMatchedForJob,
                                });
                            }
                        });
                        // Re-sort top 5 after score update
                        top5.sort((a, b) => b.matchScore - a.matchScore);
                        // Splice back into allMatched — ensure top 5 order is reflected
                        for (let i = 0; i < top5.length; i++) allMatched[i] = top5[i];
                    }
                }
            } catch (_) { /* BERT unavailable — keep exact-match results */ }
        }

        // ── Groq career insights (non-fatal) ──────────────────
        let nlpInsights = null;
        if (process.env.GROQ_API_KEY && allMatched.length > 0) {
            try {
                nlpInsights = await groqJobMatchInsights({
                    skills,
                    topMatches: allMatched.slice(0, 5),
                });
            } catch (_) { /* Groq unavailable — skip insights */ }
        }

        const topMatches    = allMatched.slice(0, 20);
        const strongMatches = allMatched.filter(j => j.matchScore >= 75).length;
        const goodMatches   = allMatched.filter(j => j.matchScore >= 50 && j.matchScore < 75).length;
        const topRole       = allMatched[0] || null;
        const avgScore      = allMatched.length
            ? Math.round(allMatched.reduce((s, j) => s + j.matchScore, 0) / allMatched.length)
            : 0;

        // Group by domain for dashboard use
        const byDomain = {};
        topMatches.forEach(j => {
            if (!byDomain[j.domain]) byDomain[j.domain] = [];
            byDomain[j.domain].push(j);
        });

        // Activity tracking (non-fatal)
        try {
            const user = await User.findById(userId);
            if (user) {
                if (!user.activityHistory) user.activityHistory = [];
                user.activityHistory.push({
                    type:        "job_match",
                    title:       "Job Match Analysis",
                    description: `${skills.length} skills matched — top role: ${topRole?.role || "N/A"} (${topRole?.matchScore || 0}%)`,
                    status:      "success",
                    timestamp:   new Date(),
                    metadata: {
                        skillsCount:  skills.length,
                        matchesFound: allMatched.length,
                        strongMatches,
                        topRole:      topRole?.role      || null,
                        topScore:     topRole?.matchScore || 0,
                    },
                });
                if (user.activityHistory.length > 100)
                    user.activityHistory = user.activityHistory.slice(-100);
                await user.save();
            }
        } catch (_) {}

        return res.json({
            success: true,
            summary: {
                skillsAnalysed: skills.length,
                totalMatches:   allMatched.length,
                strongMatches,
                goodMatches,
                avgMatchScore:  avgScore,
                topRole:        topRole?.role      || null,
                topScore:       topRole?.matchScore || 0,
                topDomain:      topRole?.domain    || null,
                topSalary:      topRole?.salary    || null,
            },
            topMatches,
            byDomain,
            matchedJobs:    topMatches,     // backward compat
            bertUsed,
            semanticBoosts,                 // which jobs got BERT score boosts
            nlpInsights,                    // Groq career insights (null if unavailable)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Job matching failed: " + error.message,
        });
    }
};