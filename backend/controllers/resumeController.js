// =============================================================================
// RESUME CONTROLLER — Professional NLP Engine
// Location: backend/controllers/resumeController.js
//
// Pipeline:
//   1. Parse file  → raw text  (pdf-parse / mammoth / fs / tesseract)
//   2. Clean text  → normalised sections
//   3. Extract     → contact · skills · experience · education · projects
//   4. Score       → ATS · readiness · tone · action-verbs
//   5. Recommend   → strengths · improvements
//   6. Persist     → User model
// =============================================================================

import fs   from "fs";
import { groqResumeAnalysis } from "../services/groqService.js";
import path from "path";
import User from "../models/User.js";
import { createRequire } from "module";

// ── CJS require for pdf-parse ────────────────────────────────────────────────
const _require = createRequire(import.meta.url);
let pdfParse = null;
try {
    const mod = _require("pdf-parse");
    pdfParse = typeof mod === "function" ? mod : (mod?.default || mod?.parse || null);
    if (typeof pdfParse !== "function") {
        console.warn("⚠  pdf-parse loaded but is not a function, type:", typeof mod);
        pdfParse = null;
    }
} catch (e) {
    console.warn("⚠  pdf-parse not found:", e.message, "— run: npm install pdf-parse");
}


// ── Optional parsers (graceful degradation if not installed) ─────────────────
let mammoth, Anthropic;
try { ({ default: mammoth } = await import("mammoth")); } catch { console.warn("⚠  mammoth not installed — DOCX fallback active"); }
try {
    const mod  = await import("@anthropic-ai/sdk");
    Anthropic  = mod.default || mod.Anthropic;
} catch { console.warn("⚠  @anthropic-ai/sdk not installed — Claude vision disabled"); }


// ═════════════════════════════════════════════════════════════════════════════
// SKILL TAXONOMY  (600 + entries across 12 categories)
// ═════════════════════════════════════════════════════════════════════════════
const SKILL_TAXONOMY = {
    languages: [
        "javascript","js","typescript","ts","python","java","c++","cpp","c#","csharp",
        "ruby","go","golang","rust","swift","kotlin","php","scala","r","matlab",
        "perl","shell","bash","powershell","lua","haskell","erlang","clojure","dart",
        "groovy","assembly","fortran","cobol","vba","objective-c","c"
    ],
    frontend: [
        "react","reactjs","react.js","vue","vuejs","angular","angularjs","svelte",
        "nextjs","next.js","nuxt","gatsby","html","html5","css","css3","sass","scss",
        "less","tailwind","tailwindcss","bootstrap","material-ui","mui","antd",
        "chakra ui","styled-components","webpack","vite","parcel","babel","jsx","tsx",
        "redux","zustand","recoil","mobx","graphql","apollo","swr","react query",
        "storybook","cypress","jest","testing library","playwright","selenium","webdriver"
    ],
    backend: [
        "node","nodejs","node.js","express","expressjs","nestjs","fastify","koa",
        "django","flask","fastapi","spring","spring boot","rails","ruby on rails",
        "laravel","symfony","asp.net",".net","dotnet","gin","fiber","echo",
        "grpc","rest","restful","graphql","websocket","microservices","serverless",
        "lambda","api gateway","oauth","jwt","passport","socket.io"
    ],
    databases: [
        "mongodb","mongoose","mysql","postgresql","postgres","sqlite","redis","cassandra",
        "elasticsearch","dynamodb","firestore","firebase","supabase","prisma","sequelize",
        "typeorm","knex","oracle","mssql","sql server","neo4j","influxdb","cockroachdb",
        "mariadb","nosql","sql","database design","orm","acid","transactions"
    ],
    cloud_devops: [
        "aws","amazon web services","azure","gcp","google cloud","heroku","vercel",
        "netlify","digitalocean","linode","docker","kubernetes","k8s","helm","terraform",
        "ansible","puppet","chef","jenkins","github actions","gitlab ci","circleci",
        "travis ci","nginx","apache","caddy","linux","ubuntu","centos","debian",
        "bash scripting","ci/cd","devops","sre","infrastructure as code","iac",
        "cloudformation","pulumi","prometheus","grafana","elk","splunk","datadog"
    ],
    ai_ml: [
        "machine learning","ml","deep learning","artificial intelligence","ai","nlp",
        "natural language processing","computer vision","tensorflow","pytorch","keras",
        "scikit-learn","sklearn","pandas","numpy","scipy","matplotlib","seaborn",
        "hugging face","transformers","llm","gpt","bert","langchain","openai","anthropic",
        "rag","vector database","pinecone","weaviate","chroma","xgboost","lightgbm",
        "random forest","neural network","cnn","rnn","lstm","attention","diffusion",
        "stable diffusion","reinforcement learning","data science","data analysis",
        "statistics","regression","classification","clustering","feature engineering"
    ],
    mobile: [
        "react native","flutter","ios","android","swift","kotlin","swiftui","jetpack compose",
        "xamarin","ionic","cordova","capacitor","expo","firebase","push notifications",
        "mobile development","app store","play store","xcode","android studio"
    ],
    tools: [
        "git","github","gitlab","bitbucket","jira","confluence","slack","notion","trello",
        "asana","figma","sketch","adobe xd","photoshop","illustrator","postman","insomnia",
        "swagger","openapi","vs code","visual studio","intellij","webstorm","pycharm",
        "eclipse","vim","neovim","tmux","linux","macos","windows","npm","yarn","pnpm",
        "pip","conda","virtualenv","poetry","cargo","maven","gradle"
    ],
    security: [
        "cybersecurity","penetration testing","ethical hacking","owasp","ssl","tls",
        "encryption","cryptography","oauth2","oidc","saml","zero trust","soc2","gdpr",
        "vulnerability assessment","firewall","ids","ips","siem","threat modeling",
        "secure coding","authentication","authorization","rbac","abac"
    ],
    data_engineering: [
        "apache spark","hadoop","kafka","flink","airflow","dbt","snowflake","bigquery",
        "redshift","databricks","delta lake","etl","elt","data pipeline","data warehouse",
        "data lake","data modeling","dimensional modeling","star schema","dbt","hive",
        "pig","mapreduce","streaming","batch processing","real-time analytics"
    ],
    blockchain: [
        "blockchain","ethereum","solidity","web3","defi","nft","smart contracts",
        "truffle","hardhat","metamask","ipfs","polygon","solana","rust","anchor"
    ],
    soft_skills: [
        "leadership","communication","teamwork","collaboration","problem solving",
        "critical thinking","agile","scrum","kanban","project management","time management",
        "presentation","mentoring","coaching","stakeholder management","negotiation",
        "analytical thinking","creativity","adaptability","remote work","cross-functional"
    ]
};

// Flatten to a searchable set with original casing preserved
const ALL_SKILLS_LIST = Object.entries(SKILL_TAXONOMY).flatMap(([cat, skills]) =>
    skills.map(s => ({ skill: s, category: cat }))
);

// Strong action verbs that signal quality
const STRONG_VERBS = new Set([
    "achieved","architected","automated","built","championed","collaborated",
    "created","delivered","designed","developed","drove","engineered","established",
    "executed","founded","grew","implemented","improved","increased","integrated",
    "launched","led","managed","mentored","migrated","optimized","orchestrated",
    "owned","pioneered","reduced","refactored","scaled","shipped","solved","spearheaded",
    "streamlined","transformed","unified","accelerated","analyzed","collaborated"
]);

// Weak verbs to flag
const WEAK_VERBS = new Map([
    ["helped",      "Led / Facilitated"],
    ["worked on",   "Engineered / Built"],
    ["responsible for", "Owned / Managed"],
    ["did",         "Executed / Delivered"],
    ["made",        "Developed / Created"],
    ["used",        "Leveraged / Implemented"],
    ["fixed",       "Resolved / Optimized"],
    ["part of",     "Contributed to"],
    ["involved in", "Drove / Spearheaded"],
    ["assisted",    "Collaborated on / Supported"]
]);


// ═════════════════════════════════════════════════════════════════════════════
// 1. FILE PARSING
// ═════════════════════════════════════════════════════════════════════════════

async function parseFile(filePath, originalName, mimetype) {
    const ext = path.extname(originalName).toLowerCase();
    console.log(`📄 Parsing file: ${originalName} (${ext}, ${mimetype})`);

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (ext === ".pdf" || mimetype === "application/pdf") {
        // Child-process PDF extraction — bypasses ESM/CJS conflict
        const buf = fs.readFileSync(filePath);
        let _pdfText;
        try { _pdfText = await extractWithPdfjs(buf, filePath, mammoth); }
        catch(e) { throw new Error(e.message); }
        const data = { text: _pdfText };
        const pageCount = typeof data.numpages === 'number' ? data.numpages : null;
        console.log(`✅ PDF parsed: ${pageCount ?? '?'} pages, ${data.text.length} chars`);
        return { text: data.text, pages: pageCount, source: "pdf" };
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────
    if (ext === ".docx" ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        if (mammoth) {
            const buf  = fs.readFileSync(filePath);
            const data = await mammoth.extractRawText({ buffer: buf });
            console.log(`✅ DOCX parsed: ${data.value.length} chars`);
            return { text: data.value, pages: null, source: "docx" };
        }
        // Fallback: try reading as text (won't work well but better than crash)
        console.warn("mammoth not installed — falling back to raw read for DOCX");
        const raw = fs.readFileSync(filePath, "utf8");
        return { text: raw.replace(/[^\x20-\x7E\n\r\t]/g, " "), pages: null, source: "docx-raw" };
    }

    // ── DOC (legacy Word) ─────────────────────────────────────────────────────
    if (ext === ".doc" || mimetype === "application/msword") {
        if (mammoth) {
            // mammoth can handle .doc too
            try {
                const buf  = fs.readFileSync(filePath);
                const data = await mammoth.extractRawText({ buffer: buf });
                console.log(`✅ DOC parsed via mammoth: ${data.value.length} chars`);
                return { text: data.value, pages: null, source: "doc" };
            } catch (e) {
                console.warn("mammoth failed on .doc:", e.message);
            }
        }
        // Fallback
        const raw = fs.readFileSync(filePath, "latin1");
        const text = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
        return { text, pages: null, source: "doc-raw" };
    }

    // ── TXT ───────────────────────────────────────────────────────────────────
    if (ext === ".txt" || mimetype === "text/plain") {
        const text = fs.readFileSync(filePath, "utf8");
        console.log(`✅ TXT read: ${text.length} chars`);
        return { text, pages: null, source: "txt" };
    }

    // ── RTF — strip control codes, keep plain words ───────────────────────────
    if (ext === ".rtf" || mimetype === "application/rtf" || mimetype === "text/rtf") {
        const raw = fs.readFileSync(filePath, "latin1");
        const text = stripRTF(raw);
        console.log(`✅ RTF stripped: ${text.length} chars`);
        if (text.trim().length < 30) throw new Error("RTF file appears empty or unreadable.");
        return { text, pages: null, source: "rtf" };
    }

    // ── ODT — unzip and extract content.xml text ──────────────────────────────
    if (ext === ".odt" || mimetype === "application/vnd.oasis.opendocument.text") {
        const text = await extractODT(filePath);
        console.log(`✅ ODT extracted: ${text.length} chars`);
        if (text.trim().length < 30) throw new Error("ODT file appears empty or unreadable.");
        return { text, pages: null, source: "odt" };
    }

    // ── Images → Groq Vision via base64 (no Anthropic key needed) ────────────
    const IMAGE_MIMES = new Set(["image/jpeg","image/jpg","image/png","image/webp","image/bmp","image/tiff"]);
    if (IMAGE_MIMES.has(mimetype) || /\.(jpg|jpeg|png|webp|bmp|tiff)$/i.test(ext)) {
        return await parseImageWithGroq(filePath, mimetype);
    }

    throw new Error(
        `Unsupported file format: "${ext}". Supported: PDF, DOCX, DOC, TXT, RTF, ODT, JPG, PNG, WEBP.`
    );
}

// ── RTF stripper — removes all RTF control words and groups ──────────────────
function stripRTF(rtf) {
    // Remove RTF header + control groups
    let text = rtf
        .replace(/\{\\[^}]*\}/g, "")          // remove {\ ... } groups
        .replace(/\\[a-z]+[-]?\d*\s?/gi, "")  // remove \controlword
        .replace(/\{|\}/g, "")                  // remove remaining braces
        .replace(/\\\n/g, "\n")                 // line breaks
        .replace(/\\par\b/gi, "\n")             // paragraph breaks
        .replace(/\\line\b/gi, "\n")
        .replace(/\\tab\b/gi, "\t")
        .replace(/\\['"]\w{2}/g, "")           // hex escapes like \'e9
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ") // strip non-ASCII
        .replace(/\s+/g, " ")
        .trim();
    return text;
}

// ── ODT extractor — reads ZIP, parses content.xml ─────────────────────────────
async function extractODT(filePath) {
    // Try unzipper first (common Node dep), then fall back to reading raw XML
    try {
        const { createReadStream } = await import("fs");
        let unzipper;
        try { ({ default: unzipper } = await import("unzipper")); } catch { unzipper = null; }

        if (unzipper) {
            const zip = await unzipper.Open.file(filePath);
            const contentFile = zip.files.find(f => f.path === "content.xml");
            if (!contentFile) throw new Error("content.xml not found in ODT");
            const buf = await contentFile.buffer();
            return stripXML(buf.toString("utf8"));
        }
    } catch (_) { /* fall through to adm-zip */ }

    try {
        let AdmZip;
        try { ({ default: AdmZip } = await import("adm-zip")); } catch { AdmZip = null; }

        if (AdmZip) {
            const zip  = new AdmZip(filePath);
            const entry = zip.getEntry("content.xml");
            if (!entry) throw new Error("content.xml not found in ODT");
            return stripXML(zip.readAsText(entry));
        }
    } catch (_) { /* fall through */ }

    // Last resort: read raw bytes and strip XML — works if ODT isn't compressed
    const raw = fs.readFileSync(filePath, "latin1");
    const xmlMatch = raw.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/gi);
    if (xmlMatch) {
        return stripXML(xmlMatch.join(" "));
    }
    throw new Error("Could not parse ODT. Install 'unzipper' or 'adm-zip': npm install unzipper");
}

// Strip XML tags and decode common entities
function stripXML(xml) {
    return xml
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#\d+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ── Image → Groq Vision (llama-3.2-11b-vision-preview) ───────────────────────
// Uses Groq's vision model — no Anthropic key needed
async function parseImageWithGroq(filePath, mimetype) {
    const GROQ_VISION_API = "https://api.groq.com/openai/v1/chat/completions";
    const key = process.env.GROQ_API_KEY;

    if (!key) {
        // Anthropic fallback if Groq key missing (shouldn't happen)
        if (Anthropic && process.env.ANTHROPIC_API_KEY) {
            return await parseImageWithAnthropic(filePath, mimetype);
        }
        throw new Error("Image parsing requires GROQ_API_KEY in .env");
    }

    console.log("🖼️  Sending image to Groq Vision…");
    const base64   = fs.readFileSync(filePath).toString("base64");
    const imgMime  = ["image/jpeg","image/png","image/webp","image/gif"].includes(mimetype)
        ? mimetype : "image/jpeg";
    const dataUrl  = `data:${imgMime};base64,${base64}`;

    const res = await fetch(GROQ_VISION_API, {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model:      "meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: dataUrl } },
                    { type: "text", text:
                        "This is a resume image. Extract ALL text exactly as it appears — " +
                        "including name, contact info, skills, experience, education, and all sections. " +
                        "Output plain text only, preserving structure with line breaks." }
                ]
            }]
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // If vision model unavailable, try Anthropic fallback
        if (Anthropic && process.env.ANTHROPIC_API_KEY) {
            console.warn("⚠  Groq vision failed, trying Anthropic fallback:", err.error?.message);
            return await parseImageWithAnthropic(filePath, mimetype);
        }
        throw new Error(`Groq vision error: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    console.log(`✅ Groq Vision extracted: ${text.length} chars`);
    if (text.trim().length < 20) throw new Error("Could not extract text from image. Please upload a text-based resume (PDF/DOCX).");
    return { text, pages: 1, source: "image-groq" };
}

// ── Anthropic Vision fallback ─────────────────────────────────────────────────
async function parseImageWithAnthropic(filePath, mimetype) {
    if (!Anthropic || !process.env.ANTHROPIC_API_KEY) {
        throw new Error("Image parsing requires GROQ_API_KEY or ANTHROPIC_API_KEY in .env");
    }
    console.log("🖼️  Sending image to Claude Vision (Anthropic fallback)…");
    const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const base64  = fs.readFileSync(filePath).toString("base64");
    const imgType = ["image/jpeg","image/png","image/webp","image/gif"].includes(mimetype)
        ? mimetype : "image/jpeg";
    const msg = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: imgType, data: base64 } },
            { type: "text",  text: "Extract ALL text from this resume image. Output plain text only, preserving all sections." }
        ]}]
    });
    const text = msg.content[0]?.text || "";
    console.log(`✅ Anthropic Vision extracted: ${text.length} chars`);
    return { text, pages: 1, source: "image-anthropic" };
}


// ═════════════════════════════════════════════════════════════════════════════
// 2. TEXT NORMALISATION
// ═════════════════════════════════════════════════════════════════════════════

function normaliseText(raw) {
    return raw
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")          // collapse horizontal whitespace
        .replace(/\n{3,}/g, "\n\n")       // max 2 blank lines
        .trim();
}

// Detect section boundaries
const SECTION_PATTERNS = {
    contact:     /^(contact|personal\s+info|about\s+me)/im,
    summary:     /^(summary|objective|profile|about|overview|professional\s+summary)/im,
    skills:      /^(skills?|technical\s+skills?|core\s+competencies|expertise|technologies)/im,
    experience:  /^(experience|work\s+experience|employment|professional\s+experience|career|work\s+history)/im,
    education:   /^(education|academic|qualifications?|degrees?|studies?|schooling)/im,
    projects:    /^(projects?|personal\s+projects?|side\s+projects?|open\s+source)/im,
    certifications: /^(certifications?|certificates?|licenses?|credentials?|courses?|training)/im,
    awards:      /^(awards?|honors?|achievements?|recognition)/im,
    languages:   /^(languages?|spoken\s+languages?)/im,
    publications:/^(publications?|papers?|research|articles?)/im,
};


// ═════════════════════════════════════════════════════════════════════════════
// 3. EXTRACTION FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

// ── Contact ──────────────────────────────────────────────────────────────────
function extractContact(text) {
    const email    = text.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/)?.[1] || null;
    const phone    = text.match(
        /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/
    )?.[0] || null;
    const linkedin = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i)?.[0] || null;
    const github   = text.match(/github\.com\/([a-zA-Z0-9\-]+)/i)?.[0] || null;
    const website  = text.match(/https?:\/\/(?!linkedin|github)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/i)?.[0] || null;

    // Name: usually the first non-empty line
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    // Name: first short line that looks like a person's name
    // Skip: ALL-CAPS section headers, lines with numbers/symbols, lines < 3 chars
    const nameLine = lines.find(l =>
        l.length >= 3 && l.length < 55 &&
        !/^(resume|cv|curriculum vitae|contact|summary|skills|email|phone|address|profile|objective)/i.test(l) &&
        !l.includes("@") &&
        !/https?:\/\//i.test(l) &&
        !/^\d/.test(l) &&
        !/[|,;:\/\()#@$%^&*+=\[\]{}]/.test(l) &&
        // Allow mixed case name (not pure numbers, not all-symbol)
        /[a-zA-Z]/.test(l) &&
        // Reject if ALL CAPS AND longer than 20 chars (likely a section header)
        !(l === l.toUpperCase() && l.length > 20)
    ) || "Unknown";

    return { name: nameLine, email, phone, linkedin, github, website };
}

// ── Skills ────────────────────────────────────────────────────────────────────
function extractSkills(text) {
    const lower  = text.toLowerCase();
    const found  = [];
    const byCategory = {};

    ALL_SKILLS_LIST.forEach(({ skill, category }) => {
        // Use word-boundary matching to avoid false positives (e.g. "C" inside "Cisco")
        const pattern = new RegExp(
            `(?<![a-z0-9])${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`,
            "i"
        );
        if (pattern.test(lower)) {
            // Avoid duplicates (case-insensitive)
            const norm = skill.toLowerCase().replace(/[\.\s]/g,'');
            if (!found.some(f => f.toLowerCase().replace(/[\.\s]/g,'') === norm)) {
                found.push(skill);
                if (!byCategory[category]) byCategory[category] = [];
                byCategory[category].push(skill);
            }
        }
    });

    return { found, byCategory };
}

// ── Experience ────────────────────────────────────────────────────────────────
const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";
const DATE_RE = new RegExp(
    `(${MONTHS})\\s*\\.?\\s*(\\d{4})|` +
    `(\\d{1,2})[\\/\\-](\\d{4})|` +
    `(\\d{4})`,
    "gi"
);

function extractDates(text) {
    const dates = [];
    let m;
    const re = new RegExp(DATE_RE.source, "gi");
    const currentYear = new Date().getFullYear();
    while ((m = re.exec(text)) !== null) {
        const year = parseInt(m[2] || m[4] || m[5]);
        if (year >= 1980 && year <= currentYear + 1) {
            dates.push(year);
        }
    }
    // Also treat "present" / "current" as this year
    if (/\b(present|current|now|ongoing)\b/i.test(text) && dates.length > 0) {
        dates.push(currentYear);
    }
    return [...new Set(dates)].sort();
}

function extractExperience(text) {
    const dates   = extractDates(text);
    const years   = dates.length > 0 ? Math.max(...dates) - Math.min(...dates) : 0;

    // Count "present" / "current" occurrences → indicates current job
    const hasPresent = /\b(present|current|now|ongoing)\b/i.test(text);

    // Detect job titles
    const titlePatterns = [
        "software engineer","developer","programmer","architect","analyst",
        "manager","director","lead","intern","consultant","designer","devops",
        "data scientist","data engineer","machine learning","full.?stack",
        "frontend","backend","product manager","scrum master","cto","ceo","vp",
        "senior","junior","principal","staff","associate","specialist"
    ];
    const titleRe    = new RegExp(`(${titlePatterns.join("|")})`, "gi");
    const titleMatches = [...new Set((text.match(titleRe) || []).map(t => t.toLowerCase()))];

    // Experience level from years
    let level;
    if (years < 1)      level = "Fresher / Entry Level";
    else if (years < 3) level = "Junior (1-3 years)";
    else if (years < 6) level = "Mid-level (3-6 years)";
    else if (years < 10)level = "Senior (6-10 years)";
    else                level = "Principal / Staff (10+ years)";

    return {
        estimatedYears: years,
        level,
        hasCurrentRole: hasPresent,
        detectedTitles: titleMatches.slice(0, 5)
    };
}

// ── Education ─────────────────────────────────────────────────────────────────
function extractEducation(text) {
    const degrees = [];

    const degreePatterns = [
        /\b(ph\.?d\.?|doctor(?:ate)?)\b/i,
        /\b(m\.?s\.?|m\.?e\.?|m\.?sc\.?|master(?:'?s)?)\b/i,
        /\b(m\.?b\.?a\.?)\b/i,
        /\b(b\.?e\.?|b\.?tech\.?|b\.?s\.?|b\.?sc\.?|bachelor(?:'?s)?)\b/i,
        /\b(a\.?s\.?|a\.?a\.?|associate(?:'?s)?)\b/i,
        /\b(diploma|certificate|bootcamp|coursework)\b/i,
        /\b(10th|12th|high\s+school|secondary|ssc|hsc|matriculation)\b/i,
    ];

    const labels = ["PhD","Master's","MBA","Bachelor's","Associate","Certificate","Secondary"];

    degreePatterns.forEach((re, i) => {
        if (re.test(text)) {
            degrees.push(labels[i] || "Degree");
        }
    });

    // Detect institutions
    const institutions = [];
    const instRe = /\b(university|college|institute|iit|nit|iiit|mit|stanford|harvard|iisc)\b/gi;
    let m;
    while ((m = instRe.exec(text)) !== null) {
        // Get surrounding context (50 chars)
        const ctx = text.slice(Math.max(0, m.index - 30), m.index + 60).replace(/\n/g, " ");
        if (!institutions.includes(ctx.trim())) institutions.push(ctx.trim());
    }

    return {
        degrees,
        highestDegree: degrees[0] || "Not detected",
        institutions: institutions.slice(0, 3)
    };
}

// ── Projects ──────────────────────────────────────────────────────────────────
function extractProjects(text) {
    const projects = [];
    // Look for lines starting with a project indicator
    const lines = text.split("\n");
    let inProjects = false;
    lines.forEach(line => {
        const l = line.trim();
        if (SECTION_PATTERNS.projects.test(l)) { inProjects = true; return; }
        if (/^(experience|education|skills|certifications|awards)/i.test(l)) { inProjects = false; }
        if (inProjects && l.length > 10 && l.length < 120 && !/^[-•*·]/.test(l)) {
            projects.push(l);
        }
    });
    return projects.slice(0, 8);
}

// ── Quantifiable achievements ─────────────────────────────────────────────────
function extractQuantifiables(text) {
    const pattern = /\b(\d{1,3}[\.,]?\d*\s*(%|x|times?|million|billion|k\b|cr\b|lakh|hours?|days?|weeks?|months?|years?|users?|customers?|engineers?|teams?|employees?|projects?|apps?|products?|features?|bugs?|tickets?|requests?))/gi;
    const matches = [...new Set((text.match(pattern) || []))];
    return matches.slice(0, 10);
}

// ── Weak verbs ────────────────────────────────────────────────────────────────
function detectWeakVerbs(text) {
    const found = [];
    WEAK_VERBS.forEach((replacement, weak) => {
        const re = new RegExp(`\\b${weak}\\b`, "gi");
        if (re.test(text)) {
            found.push({ weak, strong: replacement });
        }
    });
    return found.slice(0, 6);
}


// ═════════════════════════════════════════════════════════════════════════════
// 4. SCORING ENGINE
// ═════════════════════════════════════════════════════════════════════════════

function calculateATSScore(skills, text, contact, experience, education) {
    let score = 0;
    const breakdown = {};

    // 1. Skills breadth (0–25): realistic — 15 skills = 25 pts
    const skillCount  = (skills.found || []).length;
    const skillPoints = Math.min(25, Math.round(skillCount * 1.67));
    breakdown.skills  = skillPoints;
    score += skillPoints;

    // 2. Skill categories (0–10) — diversity across domains
    const catCount  = Object.keys(skills.byCategory || {}).length;
    const catPoints = Math.min(10, catCount * 2);
    breakdown.skillCategories = catPoints;
    score += catPoints;

    // 3. Contact completeness (0–10)
    let contactPoints = 0;
    if (contact.email)    contactPoints += 3;
    if (contact.phone)    contactPoints += 2;
    if (contact.linkedin) contactPoints += 3;
    if (contact.github)   contactPoints += 2;
    breakdown.contact = contactPoints;
    score += contactPoints;

    // 4. Quantifiable achievements (0–15)
    const quant = extractQuantifiables(text);
    const quantPoints = Math.min(15, quant.length * 3);
    breakdown.quantifiables = quantPoints;
    score += quantPoints;

    // 5. Section completeness (0–15) — only key sections count
    const KEY_SECTIONS = ['summary','skills','experience','education','projects'];
    let sections = 0;
    KEY_SECTIONS.forEach(k => { if (SECTION_PATTERNS[k]?.test(text)) sections++; });
    const sectionPoints = Math.min(15, sections * 3);
    breakdown.sections = sectionPoints;
    score += sectionPoints;

    // 6. Action verbs (0–10)
    const strongVerbsFound = [...STRONG_VERBS].filter(v =>
        new RegExp(`\\b${v}\\b`, "i").test(text)
    ).length;
    const verbPoints = Math.min(10, Math.round(strongVerbsFound * 1.2));
    breakdown.actionVerbs = verbPoints;
    score += verbPoints;

    // 7. Education (0–5)
    const eduPoints = education.degrees.length > 0 ? 5 : 0;
    breakdown.education = eduPoints;
    score += eduPoints;

    // 8. Length (0–5) — too short or too long is bad
    const words = text.split(/\s+/).length;
    // 300–700 words is ideal for a resume
    const wordPoints = words >= 300 && words <= 700 ? 5
                     : words >= 200 && words <= 1000 ? 3
                     : words >= 100 ? 1 : 0;
    breakdown.length = wordPoints;
    score += wordPoints;

    // Cap at 100
    score = Math.min(100, Math.round(score));

    const grade = score >= 85 ? "Excellent"
                : score >= 70 ? "Good"
                : score >= 50 ? "Fair"
                : "Needs Work";

    return { total: score, grade, breakdown };
}

function calculateReadinessScore(atsScore, experience, education, skills) {
    let score = 0;

    // ATS = 50% of readiness
    score += atsScore.total * 0.50;

    // Experience (max 20 pts): 1pt/year up to 10, capped at 20
    const expYears = experience.estimatedYears || 0;
    score += Math.min(20, expYears * 2);

    // Education (max 15 pts)
    const degBonus = { "PhD": 15, "Master's": 12, "MBA": 12, "Bachelor's": 10, "Associate": 6, "Certificate": 4 };
    score += degBonus[education.highestDegree] || 2;

    // Skill breadth (max 15 pts): 1pt per skill up to 15
    score += Math.min(15, (skills.found || []).length);

    return Math.min(100, Math.round(score));
}

function generateStrengths(skills, experience, contact, quant, education) {
    const s = [];
    if (skills.found.length >= 10) s.push(`Strong technical breadth — ${skills.found.length} skills detected across ${Object.keys(skills.byCategory).length} domains`);
    if (quant.length >= 3) s.push(`Excellent use of quantifiable achievements (${quant.length} metrics found)`);
    if (contact.linkedin && contact.github) s.push("Professional online presence — LinkedIn + GitHub both present");
    if (experience.estimatedYears >= 3) s.push(`Solid experience profile — approximately ${experience.estimatedYears} years in the industry`);
    if (education.degrees.includes("Master's") || education.degrees.includes("PhD")) s.push(`Advanced education (${education.highestDegree}) adds significant credibility`);
    if (skills.byCategory.ai_ml && skills.byCategory.ai_ml.length >= 3) s.push("AI/ML expertise is highly sought after in today's market");
    if (skills.byCategory.cloud_devops && skills.byCategory.cloud_devops.length >= 3) s.push("Strong cloud/DevOps skill set — very marketable");
    if (s.length === 0) s.push("Resume successfully parsed and processed");
    return s.slice(0, 5);
}

function generateImprovements(atsScore, skills, contact, quant, weakVerbs, experience, text) {
    const w = [];
    if (!contact.email)     w.push("Add a professional email address — essential for recruiters");
    if (!contact.linkedin)  w.push("Add your LinkedIn profile URL — increases callback rate by 40%");
    if (!contact.github && skills.byCategory.languages) w.push("Add GitHub link to showcase your code — critical for tech roles");
    if (quant.length < 3)   w.push("Add quantifiable achievements: 'Reduced load time by 40%', 'Managed team of 8'");
    if (weakVerbs.length > 0) w.push(`Replace weak verbs: ${weakVerbs.map(v => `"${v.weak}" → "${v.strong}"`).join("; ")}`);
    if (skills.found.length < 8) w.push("Expand technical skills section — aim for at least 10 relevant skills");
    if (!SECTION_PATTERNS.summary.test(text)) w.push("Add a professional summary/objective section (3-4 targeted sentences)");
    if (!SECTION_PATTERNS.projects.test(text) && experience.estimatedYears < 2) w.push("Add a projects section — crucial for fresh graduates to demonstrate practical skills");
    if (Object.keys(skills.byCategory).length < 3) w.push("Diversify skill categories — show breadth across languages, frameworks, and tools");
    if (atsScore.total < 60) w.push("Tailor your resume to each job description — use keywords from the JD");
    return w.slice(0, 6);
}


// ═════════════════════════════════════════════════════════════════════════════
// 5. MAIN CONTROLLER
// ═════════════════════════════════════════════════════════════════════════════

async function extractWithPdfjs(buf, filePath, mammoth) {

    // ── Strategy 1: pdf-parse (module-level, most reliable) ──────────
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
            // Do NOT set workerSrc — use disableRange+disableStream+useWorkerFetch:false instead
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
            const result = text.replace(/\s+/g, " ").trim();
            if (result.length > 30) {
                console.log("✅ PDF extracted via pdfjs-dist —", result.length, "chars");
                return result;
            }
        } catch (e) {
            console.warn("⚠  pdfjs-dist error:", e.message);
        }
    }

    // mammoth is DOCX-only — never use it for PDFs
    throw new Error(
        "Could not extract text from this PDF. Please upload as DOCX or TXT instead."
    );
}

export const uploadResume = async (req, res) => {
    console.log("\n🔥 RESUME UPLOAD — NLP ENGINE v2");
    console.log("Time:", new Date().toISOString());
    console.log("User:", req.userId);

    const uploadId = `upload_${Date.now()}`;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        console.log("📄 File:", req.file.originalname, `(${req.file.size} bytes)`);

        // ── Step 1: Parse file ──────────────────────────────────────────────
        let parsed;
        try {
            parsed = await parseFile(req.file.path, req.file.originalname, req.file.mimetype);
        } catch (parseError) {
            console.error("❌ Parse error:", parseError.message);
            return res.status(400).json({
                success: false,
                message: `Could not read file: ${parseError.message}`
            });
        }

        const text      = normaliseText(parsed.text);
        const wordCount = text.split(/\s+/).length;

        if (wordCount < 30) {
            return res.status(400).json({
                success: false,
                message: "Resume appears to be empty or unreadable. Please check the file and try again."
            });
        }

        console.log(`✅ Text ready: ${wordCount} words from ${parsed.source}`);

        // ── Step 2: Run Groq FIRST — it's more accurate than regex ─────────
        let groqData = null;
        try {
            groqData = await groqResumeAnalysis(text);
            if (groqData) console.log(`🤖 Groq analysis complete — ${groqData.skills?.length || 0} skills, ATS: ${groqData.atsScore}`);
        } catch (groqErr) {
            console.warn("⚠  Groq failed, falling back to rule-based:", groqErr.message);
        }

        // ── Step 3: Extract with regex (used as fallback/supplement) ────────
        const contactRegex  = extractContact(text);
        const skillsRegex   = extractSkills(text);
        const experience    = extractExperience(text);
        const education     = extractEducation(text);
        const projects      = extractProjects(text);
        const quant         = extractQuantifiables(text);
        const weakVerbs     = detectWeakVerbs(text);

        // ── Step 4: Merge — Groq wins on all fields where it has data ───────
        // Contact: Groq is much more accurate for name detection
        const contact = {
            name:     groqData?.contactInfo?.name     || contactRegex.name,
            email:    groqData?.contactInfo?.email    || contactRegex.email,
            phone:    groqData?.contactInfo?.phone    || contactRegex.phone,
            linkedin: groqData?.contactInfo?.linkedin || contactRegex.linkedin,
            github:   groqData?.contactInfo?.github   || contactRegex.github,
            location: groqData?.contactInfo?.location || null,
        };

        // Skills: union of Groq + regex, Groq listed first (higher quality)
        const groqSkillsLower = (groqData?.skills || []).map(s => s.toLowerCase().trim());
        const regexSkillsLower = skillsRegex.found.map(s => s.toLowerCase().trim());
        const mergedSkillsArr  = [
            ...(groqData?.skills || []),
            ...skillsRegex.found.filter(s => !groqSkillsLower.includes(s.toLowerCase().trim()))
        ];
        const skills = {
            found:      mergedSkillsArr,
            byCategory: groqData?.skillsByCategory || skillsRegex.byCategory,
        };

        // Experience: Groq wins (it reads dates more intelligently)
        const expYears = groqData?.experienceYears ?? experience.estimatedYears;
        const expLevel = groqData?.experienceLevel  || experience.level;

        // Education: Groq wins
        const edu = (groqData?.education && typeof groqData.education === 'object' && groqData.education.highestDegree)
            ? groqData.education
            : education;

        // ATS Score: Groq wins if available, else calculate
        let atsScore;
        if (groqData?.atsScore) {
            const groqAts = Math.min(100, Math.max(0, groqData.atsScore));
            atsScore = { total: groqAts, grade: groqAts >= 85 ? "Excellent" : groqAts >= 70 ? "Good" : groqAts >= 50 ? "Fair" : "Needs Work", breakdown: {} };
        } else {
            atsScore = calculateATSScore(skills, text, contact, experience, edu);
        }

        console.log(`📊 Final: ${skills.found.length} skills | ${expYears}y exp | ATS: ${atsScore.total} | Groq: ${!!groqData}`);

        // ── Step 5: Score ───────────────────────────────────────────────────
        const readinessScore = calculateReadinessScore(atsScore, { estimatedYears: expYears }, edu, skills);
        console.log(`🎯 ATS: ${atsScore.total} | Readiness: ${readinessScore}`);

        // ── Step 6: Narrative ───────────────────────────────────────────────
        // Prefer Groq's richer strengths/weaknesses; fall back to rule-based
        const strengths  = groqData?.strengths?.length  ? groqData.strengths.slice(0, 5)
                         : generateStrengths(skills, { estimatedYears: expYears, ...experience }, contact, quant, edu);
        const weaknesses = groqData?.weaknesses?.length ? groqData.weaknesses.slice(0, 6)
                         : generateImprovements(atsScore, skills, contact, quant, weakVerbs, experience, text);

        // ── Step 7: Build response ──────────────────────────────────────────
        const verbsForResponse = groqData?.verbs?.length
            ? groqData.verbs
            : weakVerbs.map(v => ({ weak: v.weak, strong: v.strong, context: "resume bullet" }));

        const toneForResponse = (groqData?.tone && typeof groqData.tone === 'object')
            ? groqData.tone
            : {
                score:       atsScore.total,
                label:       atsScore.grade,
                emoji:       atsScore.total >= 80 ? "🌟" : atsScore.total >= 60 ? "💼" : "📝",
                description: `Your resume scores ${atsScore.total}/100 on professional quality metrics.`,
                issues:      weaknesses.slice(0, 3)
            };

        const flagsForResponse = groqData?.flags?.length
            ? groqData.flags
            : [
                ...(!contact.email    ? [{ type:"error",   icon:"🚨", text:"Missing email address — critical for recruiter contact" }] : []),
                ...(!contact.linkedin ? [{ type:"warning", icon:"⚠️", text:"Add LinkedIn profile URL — increases callback rate by 40%" }] : []),
                ...(quant.length < 2  ? [{ type:"warning", icon:"⚠️", text:"Add measurable achievements with numbers (e.g. 'reduced load time by 40%')" }]
                                      : [{ type:"success", icon:"✅", text:`${quant.length} quantifiable achievements found — excellent!` }]),
                ...(skills.found.length >= 10
                    ? [{ type:"success", icon:"✅", text:`Strong skill set — ${skills.found.length} skills detected` }]
                    : [{ type:"warning", icon:"⚠️", text:"Expand your skills section — aim for 10+ relevant technologies" }]),
                ...(weakVerbs.length > 0
                    ? [{ type:"warning", icon:"⚠️", text:`${weakVerbs.length} weak action verbs detected — replace for stronger impact` }]
                    : [{ type:"success", icon:"✅", text:"Strong action verbs used throughout — great writing!" }]),
            ];

        const analysis = {
            uploadId,
            timestamp:   new Date().toISOString(),
            source:      parsed.source,
            originalname:req.file.originalname,
            uploadDate:  new Date().toISOString(),
            groqPowered: !!groqData,

            stats: {
                wordCount,
                pageCount: parsed.pages,
                charCount: text.length
            },

            contactInfo: contact,

            skills:          skills.found,
            skillsByCategory:skills.byCategory,
            skillCount:      skills.found.length,

            experience: {
                estimatedYears: expYears,
                level:          expLevel,
                detectedTitles: experience.detectedTitles,
                hasCurrentRole: experience.hasCurrentRole
            },
            experienceLevel: expLevel,

            education: {
                highestDegree: edu.highestDegree || edu.degrees?.[0] || "Not detected",
                degrees:       edu.degrees       || [],
                institutions:  edu.institutions  || []
            },

            projects,
            certifications: groqData?.certifications || [],

            achievements: {
                quantifiables: groqData?.achievements?.length ? groqData.achievements : quant,
                count:         groqData?.achievements?.length || quant.length
            },

            weakVerbs,
            verbs:   verbsForResponse,
            tone:    toneForResponse,
            flags:   flagsForResponse,

            atsScore,
            readinessScore,
            strengths,
            weaknesses,
            summary: groqData?.summary || "",

            // Fully-populated profile object for NLP cards
            profile: {
                name:            contact.name,
                email:           contact.email    || "Not found",
                phone:           contact.phone    || "Not found",
                location:        contact.location || "Not found",
                experience_years:expYears > 0 ? `${expYears} years` : "Fresher",
                education:       `${edu.highestDegree || "Not detected"}${edu.institutions?.[0] ? " — " + edu.institutions[0] : ""}`,
                top_skills:      skills.found.slice(0, 10),
                current_role:    experience.detectedTitles[0] || "Not detected",
                career_level:    expLevel
            },

            file: { original: req.file.originalname, size: req.file.size }
        };

        // ── Step 8: Persist to DB ───────────────────────────────────────────
        try {
            const user = await User.findById(req.userId);
            if (user) {
                user.resume = {
                    filename:       req.file.filename,
                    originalname:   req.file.originalname,
                    uploadDate:     new Date(),
                    skills:         skills.found,
                    experienceLevel:expLevel,
                    atsScore:       atsScore.total,
                    uploadId
                };
                user.readinessScore = readinessScore;
                user.resumeCount    = (user.resumeCount || 0) + 1;

                if (!user.resumeHistory) user.resumeHistory = [];
                user.resumeHistory.push({
                    filename:   req.file.originalname,
                    uploadDate: new Date(),
                    skills:     skills.found.length,
                    atsScore:   atsScore.total,
                    uploadId,
                    source:     "resume-upload"
                });
                if (user.resumeHistory.length > 50)
                    user.resumeHistory = user.resumeHistory.slice(-50);

                if (!user.activityHistory) user.activityHistory = [];
                user.activityHistory.push({
                    type:        "resume_upload",
                    title:       "Resume Uploaded & Analyzed",
                    description: `${req.file.originalname} — ${skills.found.length} skills, ATS ${atsScore.total}/100`,
                    status:      "success",
                    timestamp:   new Date(),
                    metadata: {
                        filename:      req.file.originalname,
                        skillsCount:   skills.found.length,
                        atsScore:      atsScore.total,
                        readinessScore,
                        groqPowered:   !!groqData
                    }
                });
                if (user.activityHistory.length > 100)
                    user.activityHistory = user.activityHistory.slice(-100);

                user.skills        = skills.found;
                user.missingSkills = [];

                await user.save();
                console.log("✅ DB updated — skills:", skills.found.length, "| ATS:", atsScore.total);
            }
        } catch (dbErr) {
            console.error("⚠  DB save error:", dbErr.message);
        }

        // ── Cleanup uploaded file ───────────────────────────────────────────
        try { fs.unlinkSync(req.file.path); } catch {}

        return res.json({ success: true, message: "Resume analyzed successfully", uploadId, analysis });

    } catch (error) {
        console.error("❌ Controller error:", error.message, "\n", error.stack);
        return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

export default { uploadResume };