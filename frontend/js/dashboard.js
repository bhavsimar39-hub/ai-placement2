// dashboard.js — reads ALL feature data from localStorage + backend

// API_BASE set globally by config.js

window.onload = loadDashboard;


// ─────────────────────────────────────────────────────────
// MAIN LOAD
// ─────────────────────────────────────────────────────────
async function loadDashboard(skipBackend = false) {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login.html"; return; }

    // 1. Paint immediately from localStorage (instant, no flicker)
    paintFromLocalStorage();

    // 2. Skip backend on manual refresh — user explicitly wants zero state
    if (skipBackend) return;

    // 3. Fetch richer data from backend and repaint
    try {
        const res = await fetch(`${API_BASE}/dashboard/data`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401) { window.location.href = "/login.html"; return; }
        if (!res.ok) throw new Error("HTTP " + res.status);

        const d = await res.json();
        if (d.success) paintFromBackend(d);

    } catch (err) {
        console.warn("Dashboard backend unavailable, using localStorage data:", err.message);
    }
}

// ─────────────────────────────────────────────────────────
// PAINT FROM LOCALSTORAGE  (instant, no API wait)
// ─────────────────────────────────────────────────────────
function paintFromLocalStorage() {
    // ── Resume ──────────────────────────────────────────
    const status     = localStorage.getItem("resume_status") || "";
    const isUploaded = status !== "" && status !== "Not Uploaded" && status !== "not_uploaded";
    setText("resumeStatus",    isUploaded ? "✓" : "✗");
    setText("resumeStatusPill",isUploaded ? "Resume Active" : "No Resume");

    // ── Readiness score ─────────────────────────────────
    const readiness = bestOf([
        localStorage.getItem("readiness_score"),
        localStorage.getItem("skill_gap_score"),
        localStorage.getItem("ats_score"),
    ]);
    setText("readinessScore", readiness ? readiness + "%" : "--%");

    // ── ATS score ───────────────────────────────────────
    const atsScore = localStorage.getItem("ats_score") || "--";
    setText("atsScore", atsScore !== "--" ? atsScore + "/100" : "--");

    // ── Skill gap ───────────────────────────────────────
    const missingSkills   = JSON.parse(localStorage.getItem("skills_missing") || "[]");
    const skillGapMissing = localStorage.getItem("skill_gap_missing") || missingSkills.length;
    const skillGapTrack   = localStorage.getItem("skill_gap_track") || "";
    setText("skillGap",      skillGapMissing);
    setText("skillGapTrack", skillGapTrack || "—");

    // ── Career DNA ──────────────────────────────────────
    const careerScore = localStorage.getItem("career_score") || "--";
    const careerLevel = localStorage.getItem("career_level") || "--";
    setText("careerScore", careerScore !== "--" ? careerScore + "/100" : "--");
    setText("careerLevel", careerLevel);

    // ── Job Match ───────────────────────────────────────
    const jobMatchCount = localStorage.getItem("job_match_count") ||
                          localStorage.getItem("job_match_total") || "0";
    const topJobRole    = localStorage.getItem("top_job_role")    || "--";
    setText("jobMatchCount", jobMatchCount);
    setText("topJobRole",    topJobRole);

    // ── Skills found / missing ──────────────────────────
    const foundSkills = JSON.parse(localStorage.getItem("skills_found") || "[]");
    renderSkillTags("skillsFound",   foundSkills,   "skill-tag",         "🎯", "No skills detected yet");
    renderSkillTags("skillsMissing", missingSkills, "skill-tag skill-tag-missing", "📝", "No gaps identified");
}

// ─────────────────────────────────────────────────────────
// PAINT FROM BACKEND  (merges with localStorage — never overwrites with zero)
// ─────────────────────────────────────────────────────────
function paintFromBackend(d) {
    // Helper: use backend value only if it's better than what localStorage has
    function best(backendVal, localKey, defaultVal = "--") {
        const local = localStorage.getItem(localKey);
        const localNum = parseInt(local);
        const backNum  = parseInt(backendVal);
        if (!isNaN(backNum) && backNum > 0) return backendVal;
        if (local && local !== "null" && local !== "" && local !== "0") return local;
        return defaultVal;
    }

    // ── Resume — never overwrite ✓ with ✗ if localStorage says uploaded ──
    const lsStatus    = localStorage.getItem("resume_status") || "";
    const lsUploaded  = lsStatus !== "" && lsStatus !== "Not Uploaded" && lsStatus !== "not_uploaded";
    const isUploaded  = d.resumeUploaded || lsUploaded;
    setText("resumeStatus",    isUploaded ? "✓" : "✗");
    setText("resumeStatusPill",isUploaded ? "Resume Active" : "No Resume");

    // ── Readiness ───────────────────────────────────────
    const readiness = best(d.readiness, "readiness_score", "--");
    setText("readinessScore", readiness !== "--" ? readiness + "%" : "--%");

    // ── ATS ─────────────────────────────────────────────
    const ats = best(d.atsScore, "ats_score", "--");
    setText("atsScore", ats !== "--" ? ats + "/100" : "--");

    // ── Skill Gap — never overwrite with 0 if localStorage has real data ──
    const lsGapMissing = localStorage.getItem("skill_gap_missing");
    const lsGapTrack   = localStorage.getItem("skill_gap_track");
    const gapMissing   = (d.skillGapMissing > 0) ? d.skillGapMissing
                       : (lsGapMissing && lsGapMissing !== "0") ? lsGapMissing
                       : "0";
    const gapTrack     = d.skillGapTrack || lsGapTrack || "—";
    setText("skillGap",      gapMissing);
    setText("skillGapTrack", gapTrack);

    // ── Career DNA — never overwrite with 0 ─────────────
    const careerScore = best(d.careerScore, "career_score", "--");
    const careerLevel = d.careerLevel || localStorage.getItem("career_level") || "--";
    setText("careerScore", careerScore !== "--" ? careerScore + "/100" : "--");
    setText("careerLevel", careerLevel);

    // ── Job Match — never overwrite with 0 ──────────────
    const jobCount  = best(d.jobMatchCount, "job_match_count", "0");
    const topRole   = d.topJobRole || localStorage.getItem("top_job_role") || "--";
    setText("jobMatchCount", jobCount);
    setText("topJobRole",    topRole);

    // ── Skills ──────────────────────────────────────────
    if (d.resumeSkills && d.resumeSkills.length > 0) {
        renderSkillTags("skillsFound", d.resumeSkills, "skill-tag", "🎯", "No skills detected yet");
    }


    // ── Experience level ────────────────────────────────
    setText("experienceLevel", d.careerLevel || d.experienceLevel || "--");
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function bestOf(vals) {
    // Pick the highest numeric value from a list of localStorage strings
    return vals
        .map(v => parseInt(v))
        .filter(n => !isNaN(n) && n > 0)
        .reduce((a, b) => Math.max(a, b), 0) || null;
}

function renderSkillTags(containerId, skills, cls, emptyIcon, emptyMsg) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!skills || skills.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">${emptyIcon}</div><div>${emptyMsg}</div></div>`;
        return;
    }
    el.innerHTML = skills.map(s => `<span class="${cls}">${s}</span>`).join("");
}



// ─────────────────────────────────────────────────────────
// REFRESH BUTTON
// ─────────────────────────────────────────────────────────
document.getElementById("refreshBtn")?.addEventListener("click", () => {
    const btn = document.getElementById("refreshBtn");
    btn.classList.add("spinning");

    // ── 1. Clear all feature localStorage keys ───────────
    [
        "resume_status","skills_found","skills_missing","readiness_score",
        "ats_score","skill_gap_score","skill_gap_track","skill_gap_missing",
        "career_score","career_level",
        "job_match_count","job_match_total","top_job_role","top_job_salary","top_job_score",
    ].forEach(k => localStorage.removeItem(k));

    // ── 2. Instantly reset every card to zero/default ────
    setText("resumeStatus",    "✗");
    setText("resumeStatusPill","No Resume");
    setText("readinessScore",  "--%");
    setText("atsScore",        "--");
    setText("skillGap",        "0");
    setText("skillGapTrack",   "—");
    setText("careerScore",     "--");
    setText("careerLevel",     "--");
    setText("jobMatchCount",   "0");
    setText("topJobRole",      "--");
    renderSkillTags("skillsFound",   [], "skill-tag",                  "🎯", "No skills detected yet");
    renderSkillTags("skillsMissing", [], "skill-tag skill-tag-missing", "📝", "No gaps identified");

    setTimeout(() => {
        loadDashboard(true);   // skipBackend=true — stay at zero after manual refresh
        btn.classList.remove("spinning");
    }, 400);
});

function logout() {
    localStorage.clear();
    window.location.href = "/login.html";
}