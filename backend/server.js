import express    from "express";
import fs         from "fs";
import cors       from "cors";
import dotenv     from "dotenv";
import path       from "path";
import { fileURLToPath } from "url";
import connectDB  from "./config/db.js";

// ── Route imports ─────────────────────────────────────────
import authRoutes      from "./routes/authRoutes.js";
import resumeRoutes    from "./routes/resumeRoutes.js";
import analysisRoutes  from "./routes/analysisRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes      from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import learningRoutes  from "./routes/learningRoutes.js";
import historyRoutes   from "./routes/historyRoutes.js";
import atsRoutes       from "./routes/atsRoutes.js";
import careerRoutes    from "./routes/careerRoutes.js";       // Career DNA
import roadmapRoutes   from "./routes/roadmapRoutes.js";
import nlpRoutes       from "./routes/nlpRoutes.js";          // NLP + /claude Groq proxy
import skillRoutes     from "./routes/skillRoutes.js";        // Skill gap + BERT
import matchRoutes     from "./routes/matchRoutes.js";        // Job match
import readinessRoutes from "./routes/readinessRoutes.js";    // Readiness score

dotenv.config();
connectDB();

// Ensure uploads/ folder exists (required by multer)
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ── API Routes ────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/resume",     resumeRoutes);
app.use("/api/analysis",   analysisRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/user",       userRoutes);
app.use("/api/interview",  interviewRoutes);
app.use("/api/learning",   learningRoutes);
app.use("/api/history",    historyRoutes);
app.use("/api/ats",        atsRoutes);
app.use("/api/career",     careerRoutes);      // POST /api/career/insights (no file upload)
app.use("/api/career-dna", careerRoutes);      // POST /api/career-dna/analyze-dna (file upload)
app.use("/api/roadmap",    roadmapRoutes);
app.use("/api/nlp",        nlpRoutes);          // includes POST /api/nlp/claude (Groq proxy)
app.use("/api/skills",     skillRoutes);         // POST /api/skills/gap + /bert-jd-match
app.use("/api/match",      matchRoutes);         // POST /api/match/match
app.use("/api/readiness",  readinessRoutes);     // POST /api/readiness/calculate

// ── Default route ─────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success:  true,
        message:  "AI Placement Platform — Backend Running",
        version:  "3.0",
        endpoints: {
            auth:           "/api/auth",
            resume:         "/api/resume/upload",
            nlp:            "/api/nlp/analyze-resume",
            nlpClaude:      "/api/nlp/claude",
            careerInsights: "/api/career/insights",
            careerDNA:      "/api/career-dna/analyze-dna",
            ats:            "/api/ats/analyze",
            skills:         "/api/skills/gap",
            bertJD:         "/api/skills/bert-jd-match",
            match:          "/api/match/match",
            roadmap:        "/api/roadmap/generate",
            readiness:      "/api/readiness/calculate",
            history:        "/api/history/my-history",
            dashboard:      "/api/dashboard/data",
        }
    });
});

// ── Token debug page (dev only) ───────────────────────────
app.get("/api/test/debug-token", (req, res) => {
    res.send(`<html><head><title>Token Debug</title>
    <style>body{font-family:monospace;padding:40px;background:#0F1419;color:#10B981}
    input{padding:10px;width:400px;background:#1A1F26;border:1px solid #10B981;color:#fff}
    button{padding:10px 20px;background:#10B981;color:white;border:none;cursor:pointer;margin-left:10px}
    .result{margin-top:20px;padding:20px;background:#1A1F26;border:1px solid #10B981}</style></head>
    <body><h1>🔐 Token Debugger</h1>
    <p>Current token:</p><div class="result" id="t">Loading...</div>
    <p style="margin-top:30px">Set token:</p>
    <input id="ti" placeholder="Paste JWT token here">
    <button onclick="localStorage.setItem('token',document.getElementById('ti').value);alert('✅ Set!');location.reload()">Set</button>
    <script>document.getElementById('t').textContent=localStorage.getItem('token')||'No token'</script>
    </body></html>`);
});

// ── Static frontend ───────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error:   process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║        🚀 AI PLACEMENT PLATFORM v3.0 — PORT ${PORT}    ║
╠══════════════════════════════════════════════════════╣
║  ✅ Resume Upload + Analysis                         ║
║  ✅ ATS Checker (pdfjs-dist)                         ║
║  ✅ Career Insights (Groq + BERT — no upload)        ║
║  ✅ Career DNA (pdfjs-dist + Groq NLP)               ║
║  ✅ NLP Analyzer                                     ║
║  ✅ Skill Gap + BERT Semantic Matching               ║
║  ✅ Job Match (64 roles, 16 domains)                 ║
║  ✅ Readiness Score Calculator                       ║
║  ✅ Learning Roadmap (Groq + BERT)                   ║
║  ✅ Activity History                                 ║
║  ✅ Dashboard (all features connected)               ║
╚══════════════════════════════════════════════════════╝
    `);
});

export default app;