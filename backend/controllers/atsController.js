import fs from "fs";
import { groqATSAnalysis } from "../services/groqService.js";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import mammoth from "mammoth";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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
        const fn  = typeof mod === "function" ? mod : (mod?.default ?? null);
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


// ── PDF TEXT EXTRACTION (4-strategy cascade) ─────────────────────────────────
async function extractPdfText(buf) {
    const errors = [];

    // ── Strategy 1: pdf-parse ────────────────────────────────────────────────
    if (pdfParse) {
        try {
            const data = await pdfParse(buf, { version: "default" });
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
                const c = await (await pdf.getPage(i)).getTextContent();
                text += c.items.map(x => x.str ?? "").join(" ") + "\n";
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
    // Last resort — reads raw stream bytes from the PDF binary.
    // Works on simple, non-compressed PDFs. Won't work on scanned/image PDFs.
    try {
        const rawText = buf.toString("latin1");

        const btEtBlocks = [...rawText.matchAll(/BT([\s\S]*?)ET/g)].map(m => m[1]);
        const chunks = [];

        for (const block of btEtBlocks) {
            const parens = [...block.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
            const hexes  = [...block.matchAll(/<([0-9A-Fa-f]+)>/g)].map(m => {
                try { return Buffer.from(m[1], "hex").toString("utf8"); }
                catch { return ""; }
            });
            chunks.push(...parens, ...hexes);
        }

        const result = chunks
            .join(" ")
            .replace(/[^\x20-\x7E\n]/g, " ")
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
        "Could not extract text from this PDF.\n" +
        "• Make sure it is a text-based PDF (not a scanned image)\n" +
        "• Or convert to DOCX / TXT and upload that instead\n" +
        `(Tried: ${errors.join(" | ")})`
    );
}

export const analyzeResume = async (req, res) => {
    try {
        const userId = req.userId;
        const file   = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded. Please select a PDF or DOCX file."
            });
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: "File size exceeds 5MB limit"
            });
        }

        // ── TEXT EXTRACTION ──────────────────────────────────────────────────
        let resumeText = "";
        const fileExtension = path.extname(file.originalname).toLowerCase();

        try {
            if (file.mimetype === "application/pdf" || fileExtension === ".pdf") {
                const buf = fs.readFileSync(file.path);
                resumeText = await extractPdfText(buf);

            } else if (
                file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileExtension === ".docx"
            ) {
                const result = await mammoth.extractRawText({ path: file.path });
                resumeText = result.value;

            } else if (fileExtension === ".doc" || file.mimetype === "application/msword") {
                try {
                    const result = await mammoth.extractRawText({ path: file.path });
                    resumeText = result.value;
                } catch {
                    resumeText = fs.readFileSync(file.path, "latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ");
                }

            } else if (fileExtension === ".txt" || file.mimetype === "text/plain") {
                resumeText = fs.readFileSync(file.path, "utf8");

            } else if (
                /\.(jpg|jpeg|png|webp|bmp|tiff)$/i.test(fileExtension) ||
                file.mimetype.startsWith("image/")
            ) {
                resumeText = req.body.extractedText || "";
                if (!resumeText) {
                    throw new Error("Image resumes require client-side extraction. Please use the browser-based analyzer.");
                }

            } else {
                throw new Error(
                    `Unsupported file type: ${file.mimetype}. ` +
                    `Please upload PDF, DOCX, DOC, or TXT. File extension: ${fileExtension}`
                );
            }

            // Validate extracted text
            if (!resumeText || resumeText.trim().length < 50) {
                throw new Error(
                    "Could not extract enough text from the file. Please ensure:\n" +
                    "• PDF is text-based (not a scanned image)\n" +
                    "• DOCX file is not corrupted\n" +
                    "• File contains actual resume content\n" +
                    `Only extracted ${resumeText.trim().length} characters.`
                );
            }

        } catch (extractError) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: "Failed to extract text from file: " + extractError.message
            });
        }

        // ── ANALYSIS — Groq-first, rule-based fallback ───────────────────────
        let analysis = null;
        try {
            analysis = await groqATSAnalysis(resumeText);
        } catch (_) { analysis = null; }

        if (!analysis) {
            analysis = performATSAnalysis(resumeText);
        }

        // ── SAVE TO DB ───────────────────────────────────────────────────────
        try {
            const user = await User.findById(userId);
            if (user) {
                if (!user.atsAnalysis) user.atsAnalysis = [];
                user.atsAnalysis.push({
                    resumeId:          file.filename,
                    score:             analysis.score,
                    analysis:          analysis.analysis,
                    issues:            analysis.issues,
                    recommendations:   analysis.recommendations,
                    optimizedKeywords: analysis.optimizedKeywords,
                    missingKeywords:   analysis.missingKeywords,
                    analyzedAt:        new Date()
                });

                if (!user.activityHistory) user.activityHistory = [];
                user.activityHistory.push({
                    type:        "ats_check",
                    title:       "ATS Check Performed",
                    description: `Analyzed: ${file.originalname} - Score: ${analysis.score}/100`,
                    status:      "success",
                    timestamp:   new Date(),
                    metadata: {
                        score:       analysis.score,
                        atsScore:    analysis.score,
                        filename:    file.originalname,
                        issuesCount: analysis.issues?.length || 0,
                        groqPowered: analysis.groqPowered || false,
                    }
                });

                if (user.activityHistory.length > 100) {
                    user.activityHistory = user.activityHistory.slice(-100);
                }

                await user.save();
            }
        } catch (dbError) {
            console.error("⚠️ DB error:", dbError.message);
        }

        // ── CLEANUP ──────────────────────────────────────────────────────────
        try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (_) { /* ignore cleanup errors */ }

        return res.json({
            success:    true,
            message:    "Resume analyzed successfully",
            resumeText: resumeText.substring(0, 8000),
            analysis
        });

    } catch (error) {
        try {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (_) { /* ignore */ }

        return res.status(500).json({
            success: false,
            message: "Analysis failed: " + error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// ATS ANALYSIS LOGIC
// ═══════════════════════════════════════════════════════════════════

function performATSAnalysis(resumeText) {
    const text  = resumeText.toLowerCase();
    const lines = resumeText.split("\n").filter(l => l.trim());

    let formatScore    = 0;
    let keywordScore   = 0;
    let structureScore = 0;
    let contentScore   = 0;

    const issues             = [];
    const recommendations    = [];
    const optimizedKeywords  = [];
    const missingKeywords    = [];

    // ── FORMAT ANALYSIS ──────────────────────────────────────────────────────
    const hasSummary    = /summary|objective|profile|about|overview/.test(text);
    const hasExperience = /experience|employment|work history|professional background/.test(text);
    const hasEducation  = /education|academic|qualification|degree/.test(text);
    const hasSkills     = /skills|technical|competencies|technologies/.test(text);

    if (hasSummary) formatScore += 20;
    else issues.push({ type: "warning", category: "Structure", message: "Missing professional summary or objective section", fix: "Add a brief 2-3 sentence summary at the top of your resume" });

    if (hasExperience) formatScore += 30;
    else issues.push({ type: "error", category: "Structure", message: "No experience section found", fix: "Add a work experience or employment history section" });

    if (hasEducation) formatScore += 20;
    else issues.push({ type: "warning", category: "Structure", message: "Education section not clearly identified", fix: "Add a dedicated education section" });

    if (hasSkills) formatScore += 20;
    else issues.push({ type: "error", category: "Structure", message: "Skills section missing or not clearly labeled", fix: "Add a skills section with relevant technical and soft skills" });

    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
    const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
    if (hasEmail && hasPhone) formatScore += 10;
    else issues.push({ type: "error", category: "Contact", message: "Missing contact information (email or phone)", fix: "Ensure email and phone number are clearly visible at the top" });

    // ── KEYWORD ANALYSIS ─────────────────────────────────────────────────────
    const commonKeywords = [
        "leadership", "management", "team", "project", "analysis",
        "development", "communication", "problem-solving", "strategic",
        "results", "experience", "skills", "proficient", "expert"
    ];
    const technicalKeywords = [
        "python", "java", "javascript", "react", "node",
        "sql", "aws", "cloud", "agile", "scrum", "git",
        "api", "database", "backend", "frontend"
    ];

    let foundCommon = 0, foundTechnical = 0;
    commonKeywords.forEach(kw => {
        if (text.includes(kw)) { foundCommon++; optimizedKeywords.push(kw); }
        else if (missingKeywords.length < 10) missingKeywords.push(kw);
    });
    technicalKeywords.forEach(kw => {
        if (text.includes(kw)) { foundTechnical++; if (!optimizedKeywords.includes(kw)) optimizedKeywords.push(kw); }
    });

    keywordScore = Math.min(100, (foundCommon / commonKeywords.length) * 60 + (foundTechnical / technicalKeywords.length) * 40);
    if (keywordScore < 50) recommendations.push("Increase use of industry-relevant keywords and action verbs");

    // ── STRUCTURE ANALYSIS ───────────────────────────────────────────────────
    const hasBullets = /[•●■▪▸→-]\s/.test(resumeText) || lines.some(l => /^\s*[-*]\s/.test(l));
    if (hasBullets) structureScore += 30;
    else issues.push({ type: "warning", category: "Formatting", message: "No bullet points detected in experience section", fix: "Use bullet points to list achievements and responsibilities" });

    const hasMetrics = /\d+%|\$\d+|[0-9]+\s*(users|clients|projects|sales|revenue)/i.test(resumeText);
    if (hasMetrics) { structureScore += 40; optimizedKeywords.push("quantifiable achievements"); }
    else recommendations.push('Add quantifiable achievements (e.g., "Increased sales by 25%")');

    if (resumeText.length > 500 && resumeText.length < 5000) structureScore += 30;
    else if (resumeText.length >= 5000) {
        issues.push({ type: "warning", category: "Length", message: "Resume may be too long", fix: "Consider condensing to 1-2 pages for better ATS compatibility" });
        structureScore += 15;
    } else {
        issues.push({ type: "error", category: "Length", message: "Resume appears too short", fix: "Expand your experience and skills sections" });
    }

    // ── CONTENT ANALYSIS ─────────────────────────────────────────────────────
    const actionVerbs = ["managed", "developed", "created", "improved", "led", "implemented", "achieved", "designed"];
    let foundVerbs = 0;
    actionVerbs.forEach(verb => { if (text.includes(verb)) foundVerbs++; });
    contentScore += Math.min(40, (foundVerbs / actionVerbs.length) * 40);

    const hasFirstPerson = /\b(i|my|me)\b/i.test(resumeText);
    if (!hasFirstPerson) contentScore += 30;
    else issues.push({ type: "warning", category: "Writing Style", message: "First-person pronouns detected (I, my, me)", fix: "Remove first-person pronouns and use action verbs directly" });

    if (lines.length > 10) contentScore += 30;

    // ── OVERALL SCORE ────────────────────────────────────────────────────────
    const overallScore = Math.round((formatScore + keywordScore + structureScore + contentScore) / 4);

    if (overallScore < 60) {
        recommendations.push("Focus on adding industry-specific keywords relevant to your target role");
        recommendations.push("Structure your experience using the STAR method (Situation, Task, Action, Result)");
    }
    if (optimizedKeywords.length < 10) recommendations.push("Expand your skills section with both technical and soft skills");
    if (!hasMetrics) recommendations.push("Quantify your achievements with specific numbers and percentages");

    return {
        score: overallScore,
        analysis: {
            formatScore:    Math.round(formatScore),
            keywordScore:   Math.round(keywordScore),
            structureScore: Math.round(structureScore),
            contentScore:   Math.round(contentScore)
        },
        issues,
        recommendations,
        optimizedKeywords: optimizedKeywords.slice(0, 20),
        missingKeywords:   missingKeywords.slice(0, 15)
    };
}