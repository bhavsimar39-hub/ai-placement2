import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

// Static folder
app.use(express.static(path.join(process.cwd(), "frontend")));

// Default Page → login
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "frontend/login.html"));
});

// All pages
const pages = [
    "login",
    "signup",
    "dashboard",
    "resume-upload",
    "job-match",
    "skill-gap",
    "readiness",
    "analysis",
    "settings",
    "sidebar",
    "confirm-email",
    "reset-password",
    "auth-callback"
];

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(process.cwd(), `frontend/${page}.html`));
    });
});

// 404
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

app.listen(PORT, () => {
    console.log(`Frontend running at http://localhost:${PORT}`);
});