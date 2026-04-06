// =============================================
// NLP Controller - COMPLETE FIX v2
// Fixed: pdf-parse ESM/CJS conflict, pdfjs-dist worker error,
//        added pdf2json fallback, raw PDF byte-stream last resort
// =============================================

import fs from "fs";
import path from "path";
import { groqNLPAnalysis } from "../services/groqService.js";
import mammoth from "mammoth";
import { createRequire } from "module";
import User from "../models/User.js";

// ── CJS require ──────────────────────────────────────────────────────────────
const _require = createRequire(import.meta.url);

// ── Strategy 1 loader: pdf-parse (tries multiple import paths) ──────────────
let pdfParse = null;
const pdfParseCandidates = [
    () => _require("pdf-parse"),
    () => _require("pdf-parse/lib/pdf-parse.js"),   // direct lib path avoids ESM shim issues
];
for (const loader of pdfParseCandidates) {
    try {
        const mod = loader();
        const fn = typeof mod === "function" ? mod : (mod?.default ?? null);
        if (typeof fn === "function") { pdfParse = fn; break; }
    } catch (_) { /* try next */ }
}
if (pdfParse) {
    console.log("✅ pdf-parse loaded successfully");
} else {
    console.warn("⚠  pdf-parse unavailable — will try fallbacks");
}

// ── Strategy 3 loader: pdf2json (designed for Node.js servers, no worker needed) ──
let PDFParser = null;
try {
    PDFParser = _require("pdf2json");
    console.log("✅ pdf2json loaded successfully");
} catch (_) {
    console.warn("⚠  pdf2json unavailable — install with: npm install pdf2json");
}

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

// ==================== PDF EXTRACTION ====================
async function extractTextFromPDF(filePath) {
    const buf = fs.readFileSync(filePath);
    const errors = [];

    // ── Strategy 1: pdf-parse ────────────────────────────────────────────────
    if (pdfParse) {
        try {
            const data = await pdfParse(buf, {
                // Suppress the noisy "test/unit" directory log that pdf-parse emits
                version: "default",
            });
            if (data?.text?.trim().length > 30) {
                console.log("✅ PDF extracted via pdf-parse —", data.text.trim().length, "chars");
                return data.text.replace(/\s+/g, " ").trim();
            }
            errors.push("pdf-parse: returned empty text");
        } catch (e) {
            console.warn("⚠  pdf-parse error:", e.message);
            errors.push(`pdf-parse: ${e.message}`);
        }
    }

    // ── Strategy 2: pdfjs-dist ───────────────────────────────────────────────
    // workerSrc MUST be set to "" to disable the worker in a Node environment
    let getDocument = null, GlobalWorkerOptions = null;
    for (const mod of [
        "pdfjs-dist/legacy/build/pdf.mjs",
        "pdfjs-dist/build/pdf.mjs",
    ]) {
        try {
            const m = await import(mod);
            getDocument         = m.getDocument         ?? m.default?.getDocument         ?? null;
            GlobalWorkerOptions = m.GlobalWorkerOptions ?? m.default?.GlobalWorkerOptions ?? null;
            if (getDocument && GlobalWorkerOptions) break;
        } catch (_) { continue; }
    }

    if (getDocument && GlobalWorkerOptions) {
        try {
            // ✅ FIX: disable worker explicitly so Render/Node doesn't throw
            GlobalWorkerOptions.workerSrc = "";

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
                const page    = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(x => x.str ?? "").join(" ") + "\n";
            }
            const result = text.replace(/\s+/g, " ").trim();
            if (result.length > 30) {
                console.log("✅ PDF extracted via pdfjs-dist —", result.length, "chars");
                return result;
            }
            errors.push("pdfjs-dist: returned empty text");
        } catch (e) {
            console.warn("⚠  pdfjs-dist error:", e.message);
            errors.push(`pdfjs-dist: ${e.message}`);
        }
    } else {
        errors.push("pdfjs-dist: module not found");
    }

    // ── Strategy 3: pdf2json ─────────────────────────────────────────────────
    // Purpose-built for server-side Node.js, no worker, no native deps
    if (PDFParser) {
        try {
            const text = await new Promise((resolve, reject) => {
                const parser = new PDFParser(null, 1); // '1' = raw text mode

                parser.on("pdfParser_dataReady", (pdfData) => {
                    try {
                        // pdfData.Pages is the parsed page array
                        const pages = pdfData?.Pages ?? pdfData?.formImage?.Pages ?? [];
                        const extracted = pages
                            .flatMap(page => page.Texts ?? [])
                            .map(t => decodeURIComponent(t.R?.map(r => r.T ?? "").join("") ?? ""))
                            .join(" ")
                            .replace(/\s+/g, " ")
                            .trim();
                        resolve(extracted);
                    } catch (parseErr) {
                        reject(parseErr);
                    }
                });

                parser.on("pdfParser_dataError", (errData) => {
                    reject(new Error(errData?.parserError ?? "pdf2json parse error"));
                });

                parser.parseBuffer(buf);
            });

            if (text.length > 30) {
                console.log("✅ PDF extracted via pdf2json —", text.length, "chars");
                return text;
            }
            errors.push("pdf2json: returned empty text");
        } catch (e) {
            console.warn("⚠  pdf2json error:", e.message);
            errors.push(`pdf2json: ${e.message}`);
        }
    } else {
        errors.push("pdf2json: module not installed");
    }

    // ── Strategy 4: Raw PDF byte-stream extraction ───────────────────────────
    // Last resort — reads raw stream bytes directly from the PDF binary.
    // Works on simple, non-compressed PDFs. Won't work on scanned/image PDFs.
    try {
        const rawText = buf.toString("latin1");

        // Extract readable strings from BT...ET text blocks
        const btEtBlocks = [...rawText.matchAll(/BT([\s\S]*?)ET/g)].map(m => m[1]);
        const chunks = [];

        for (const block of btEtBlocks) {
            // Match strings inside parentheses, e.g. (Hello World)
            const parens = [...block.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
            // Match hex strings, e.g. <48656C6C6F>
            const hexes  = [...block.matchAll(/<([0-9A-Fa-f]+)>/g)].map(m => {
                try {
                    return Buffer.from(m[1], "hex").toString("utf8");
                } catch { return ""; }
            });
            chunks.push(...parens, ...hexes);
        }

        const result = chunks
            .join(" ")
            .replace(/[^\x20-\x7E\n]/g, " ")   // strip non-printable chars
            .replace(/\s+/g, " ")
            .trim();

        if (result.length > 30) {
            console.log("✅ PDF extracted via raw byte-stream —", result.length, "chars");
            return result;
        }
        errors.push("raw stream: returned empty text (likely scanned/image PDF)");
    } catch (e) {
        errors.push(`raw stream: ${e.message}`);
    }

    // ── All strategies failed ────────────────────────────────────────────────
    console.error("❌ All PDF extraction strategies failed:", errors);
    throw new Error(
        "Could not extract text from this PDF. " +
        "If it is a scanned/image-based PDF, please convert it to DOCX or TXT first. " +
        `(Tried: ${errors.join(" | ")})`
    );
}

// ==================== FILE EXTRACTION ====================
async function extractTextFromFile(file) {
    const filePath = file.path;
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    try {
        let text = "";

        if (fileExtension === "pdf") {
            text = await extractTextFromPDF(filePath);
        } else if (fileExtension === "docx" || fileExtension === "doc") {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (fileExtension === "txt" || fileExtension === "rtf") {
            text = fs.readFileSync(filePath, "utf-8");
        } else {
            throw new Error("Unsupported file format: " + fileExtension);
        }

        text = text.replace(/\s+/g, " ").trim();

        if (text.length < 50) {
            throw new Error("Resume too short or could not extract text");
        }

        return text;

    } finally {
        // Always clean up the temp upload
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (_) { /* ignore cleanup errors */ }
    }
}

// ==================== NLP FUNCTIONS ====================
function extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundSkills = new Set();
    const skillDetails = [];

    ALL_SKILLS.forEach(skill => {
        const skillLower  = skill.toLowerCase();
        const escaped     = skillLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex       = new RegExp(`\\b${escaped}\\b`, "i");

        if (regex.test(textLower)) {
            foundSkills.add(skill);
            skillDetails.push({ skill, category: getCategoryForSkill(skill), proficiency: "Detected" });
        }
    });

    return { skills: Array.from(foundSkills), detailedSkills: skillDetails };
}

function getCategoryForSkill(skill) {
    for (const [category, skills] of Object.entries(TECH_SKILLS)) {
        if (skills.includes(skill)) return category;
    }
    return "other";
}

function extractExperience(text) {
    const match = text.match(/(\d+\.?\d*)\+?\s*years?\s+(?:of\s+)?experience/i);
    if (match) return { text: match[0], years: parseFloat(match[1]), confidence: "high" };
    return { text: "Not mentioned", years: 0, confidence: "low" };
}

function calculateATSScore(text, skills) {
    let score = 0;
    const t = text.toLowerCase();
    if (t.includes("experience"))                       score += 10;
    if (t.includes("education"))                        score += 10;
    if (t.includes("skills"))                           score += 10;
    score += Math.min(40, skills.length * 2);
    if (/@/.test(text))                                 score += 10;
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text))        score += 10;
    if (text.length > 500)                              score += 10;
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

// ==================== MAIN CONTROLLER ====================
export const analyzeResumeNLP = async (req, res) => {
    const uploadId = `nlp_${Date.now()}`;

    console.log("\n📊 NLP ANALYSIS STARTED");
    console.log("User ID:", req.userId);
    console.log("Time:", new Date().toISOString());

    try {
        if (!req.file) {
            console.error("❌ No file uploaded");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        console.log("📄 File:", req.file.originalname, `(${req.file.size} bytes)`);
        const startTime = Date.now();

        // Extract text
        const resumeText = await extractTextFromFile(req.file);
        console.log("✅ Text extracted:", resumeText.length, "characters");

        if (resumeText.length < 100) {
            return res.status(400).json({
                success: false,
                message: "Resume too short or could not extract text",
            });
        }

        const jobDescription = req.body.jobDescription || null;

        // ── Groq NLP analysis (primary) ───────────────────────────────────────
        let groqResult = null;
        try {
            console.log("🤖 Calling Groq AI for analysis...");
            groqResult = await groqNLPAnalysis(resumeText, jobDescription);
            if (groqResult) console.log("✅ Groq analysis complete");
        } catch (groqError) {
            console.warn("⚠️ Groq analysis failed:", groqError.message);
        }

        // ── Rule-based fallback ───────────────────────────────────────────────
        const skillsData  = extractSkills(resumeText);
        const experience  = extractExperience(resumeText);
        const atsScore    = calculateATSScore(resumeText, skillsData.skills);

        console.log("✅ Skills found:", skillsData.skills.length);
        console.log("✅ Experience:",   experience.years, "years");
        console.log("✅ ATS Score:",    atsScore);

        // ── Merge Groq + rule-based ───────────────────────────────────────────
        const finalSkills = (groqResult?.skills?.length ?? 0) > skillsData.skills.length
            ? groqResult.skills
            : skillsData.skills;

        const overallScore = groqResult?.overallScore ?? Math.min(100, Math.round(
            Math.min(40, skillsData.skills.length * 2) +
            Math.min(30, experience.years * 5) +
            (atsScore * 0.2)
        ));

        const processingTime = Date.now() - startTime;

        // ── Persist to DB ─────────────────────────────────────────────────────
        if (req.userId) {
            try {
                const user = await User.findById(req.userId);
                if (user) {
                    console.log("✅ User found:", user.email);

                    user.resumeCount = (user.resumeCount || 0) + 1;
                    console.log("📊 Resume count will be:", user.resumeCount);

                    if (!user.resumeHistory) user.resumeHistory = [];
                    user.resumeHistory.push({
                        filename:   req.file.originalname,
                        uploadDate: new Date(),
                        skills:     finalSkills.length,
                        atsScore,
                        uploadId,
                        source:     "nlp-analyzer",
                    });
                    if (user.resumeHistory.length > 50) user.resumeHistory = user.resumeHistory.slice(-50);

                    if (!user.activityHistory) user.activityHistory = [];
                    user.activityHistory.push({
                        type:        "resume_upload",
                        title:       "Resume Uploaded",
                        description: `Uploaded: ${req.file.originalname} - ${finalSkills.length} skills found`,
                        status:      "success",
                        timestamp:   new Date(),
                        metadata: {
                            filename:    req.file.originalname,
                            skillsCount: finalSkills.length,
                            atsScore,
                            overallScore,
                            analyzer:    "nlp",
                            groqPowered: !!groqResult,
                        },
                    });
                    if (user.activityHistory.length > 100) user.activityHistory = user.activityHistory.slice(-100);

                    console.log("💾 Saving to database...");
                    await user.save();
                    console.log("✅ Database updated successfully!");
                    console.log(`   - Resume count: ${user.resumeCount}`);
                    console.log(`   - Resume history: ${user.resumeHistory.length} items`);
                    console.log(`   - Activity history: ${user.activityHistory.length} items`);
                }
            } catch (dbError) {
                console.error("⚠️ DB error:", dbError.message);
                console.error("   Stack:", dbError.stack);
            }
        }

        const analysis = {
            overallScore,
            skills:           finalSkills,
            skillsByCategory: groqResult?.skillsByCategory || groupSkillsByCategory(skillsData.detailedSkills),
            detailedSkills:   skillsData.detailedSkills,
            experience:       experience.text,
            experienceYears:  groqResult?.experienceYears ?? experience.years,
            atsScore:         groqResult?.atsScore        ?? atsScore,
            atsLevel:         atsScore >= 80 ? "Excellent" : atsScore >= 60 ? "Good" : "Fair",
            recommendations:  groqResult?.recommendations?.length ? groqResult.recommendations : [],
            insights:         groqResult?.insights     || [],
            improvements:     groqResult?.improvements || [],
            keyPhrases:       groqResult?.keyPhrases   || [],
            writingQuality:   groqResult?.writingQuality || "average",
            sentiment:        groqResult?.sentiment     || "neutral",
            groqPowered:      !!groqResult,
            processingTime:   `${processingTime}ms`,
            uploadId,
        };

        if (groqResult?.jobMatch) analysis.jobMatch = groqResult.jobMatch;

        console.log("✅ NLP ANALYSIS COMPLETE");
        return res.json({ success: true, analysis });

    } catch (error) {
        console.error("❌ NLP Analysis Error:", error.message);
        console.error("   Stack:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Analysis failed: " + error.message,
            error:   error.message,
        });
    }
};