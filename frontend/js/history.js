// frontend/js/history.js
// Activity History page — full rewrite
// Fixes: missing stat IDs, chart single-point crash, jagged line,
//        missing activity types, BERT session cluster display

let historyData = null;

// ═══════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login.html"; return; }
    loadHistory();
});

// ═══════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════
async function loadHistory() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login.html"; return; }

    setLoadingAll(true);

    try {
        const res = await fetch(`${API_BASE}/history/my-history`, {
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (res.status === 401) { window.location.href = "/login.html"; return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Unknown error");

        historyData = data;

        displayStats(data.stats);
        displayActivities(data.recentActivity);
        displayLogins(data.recentLogins);
        displayAtsSection(data.atsHistory || []);
        displaySessionClusters(data.sessionClusters || []);

    } catch (err) {
        showError("Failed to load history: " + err.message);
    }
}

window.loadUserData = loadHistory;
window.clearHistory = clearHistory;

// ═══════════════════════════════════════════════════════════
// STATS — fix: only update IDs that exist in the DOM
// ═══════════════════════════════════════════════════════════
function displayStats(stats) {
    if (!stats) return;
    const MAP = {
        totalLogins:     stats.totalLogins     ?? 0,
        loginsToday:     stats.loginsToday     ?? 0,
        atsChecks:       stats.atsChecks       ?? 0,
        latestAtsScore:  stats.latestAtsScore  ?? "—",
        avgAtsScore:     stats.avgAtsScore     ?? 0,
        bestAtsScore:    stats.bestAtsScore    ?? 0,
        readinessScore:  stats.readinessScore  ?? 0,
        resumeUploads:   stats.resumeUploads   ?? 0,
        skillGapChecks:  stats.skillGapChecks  ?? 0,
        jobMatchChecks:  stats.jobMatchChecks  ?? 0,
        totalActivities: stats.totalActivities ?? 0,
    };
    Object.entries(MAP).forEach(([id, val]) => setText(id, val));
}

// ═══════════════════════════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════════════════════════
function displayActivities(activities) {
    const container = document.getElementById("activityList");
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = emptyState("📭", "No Recent Activity", "Start using the platform to see your activity here");
        return;
    }

    container.innerHTML = activities.map(a => {
        const icon      = getActivityIcon(a.type);
        const color     = getActivityColor(a.type);
        const timeAgo   = getTimeAgo(new Date(a.timestamp));
        const statusCls = a.status === "success" ? "status-success"
                        : a.status === "error"   ? "status-failed"
                        : "status-pending";
        const meta = buildMetaChips(a);

        return `
        <div class="activity-item">
            <div class="activity-icon" style="color:${color}">${icon}</div>
            <div class="activity-content">
                <div class="activity-title">${escHtml(a.title || labelType(a.type))}</div>
                <div class="activity-description">${escHtml(a.description || "")}</div>
                ${meta ? `<div class="activity-meta-row">${meta}</div>` : ""}
                <div class="activity-time">${timeAgo}</div>
            </div>
            <span class="activity-status ${statusCls}">
                ${a.status === "success" ? "✓" : a.status === "error" ? "✗" : "○"} ${capitalise(a.status || "done")}
            </span>
        </div>`;
    }).join("");
}

function buildMetaChips(a) {
    if (!a.metadata) return "";
    const chips = [];
    // Handle both score and atsScore field names
    const atsVal = a.metadata.score ?? a.metadata.atsScore ?? a.metadata.ats_score;
    if (typeof atsVal === "number" || (typeof atsVal === "string" && !isNaN(parseFloat(atsVal)))) {
        const n = typeof atsVal === "number" ? atsVal : parseFloat(atsVal);
        chips.push(`<span class="meta-chip chip-${scoreClass(n)}">ATS ${n}</span>`);
    }
    if (typeof a.metadata.readinessScore === "number")
        chips.push(`<span class="meta-chip chip-good">Readiness ${a.metadata.readinessScore}%</span>`);
    if (typeof a.metadata.matchScore === "number" || typeof a.metadata.topScore === "number") {
        const s = a.metadata.matchScore ?? a.metadata.topScore;
        chips.push(`<span class="meta-chip chip-good">Match ${s}%</span>`);
    }
    if (a.metadata.grade)
        chips.push(`<span class="meta-chip chip-neutral">${escHtml(a.metadata.grade)}</span>`);
    if (typeof a.metadata.missingCount === "number")
        chips.push(`<span class="meta-chip chip-poor">${a.metadata.missingCount} gaps</span>`);
    return chips.join("");
}

// ═══════════════════════════════════════════════════════════
// LOGIN HISTORY
// ═══════════════════════════════════════════════════════════
function displayLogins(logins) {
    const container = document.getElementById("loginList");
    if (!container) return;

    if (!logins || logins.length === 0) {
        container.innerHTML = emptyState("🔐", "No Login History", "Your login sessions will appear here");
        return;
    }

    container.innerHTML = logins.map((l, i) => {
        const date     = new Date(l.timestamp);
        const timeAgo  = getTimeAgo(date);
        const fullDate = date.toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
        return `
        <div class="login-item${i === 0 ? " login-latest" : ""}">
            <div class="login-icon">🔐</div>
            <div class="login-content">
                <div class="login-time">${fullDate}${i === 0 ? ' <span class="latest-badge">Latest</span>' : ""}</div>
                ${l.ipAddress ? `<div class="login-details">📍 ${escHtml(l.ipAddress)}</div>` : ""}
                ${l.userAgent ? `<div class="login-details">💻 ${escHtml(getDeviceInfo(l.userAgent))}</div>` : ""}
            </div>
            <div class="login-ago">${timeAgo}</div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════
// ATS SECTION
// ═══════════════════════════════════════════════════════════
function displayAtsSection(atsHistory) {
    const container = document.getElementById("atsGraphContainer");
    if (!container) return;

    if (!atsHistory || atsHistory.length === 0) {
        container.innerHTML = emptyState("📊", "No ATS Data Yet", "Upload a resume to see your ATS score analytics");
        return;
    }

    const chronological = [...atsHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const vals   = chronological.map(s => s.score);
    const latest = vals[vals.length - 1];
    const avg    = Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
    const best   = Math.max(...vals);
    const trend  = vals.length > 1 ? latest - vals[0] : 0;
    const trendTxt = trend > 0 ? `📈 +${trend}` : trend < 0 ? `📉 ${trend}` : "➡️ 0";

    container.innerHTML = `
        <div class="ats-summary">
            <div class="ats-summary-card">
                <div class="ats-summary-label">Latest Score</div>
                <div class="ats-summary-value ${scoreClass(latest)}">${latest}</div>
            </div>
            <div class="ats-summary-card">
                <div class="ats-summary-label">Average</div>
                <div class="ats-summary-value ${scoreClass(avg)}">${avg}</div>
            </div>
            <div class="ats-summary-card">
                <div class="ats-summary-label">Best Score</div>
                <div class="ats-summary-value ${scoreClass(best)}">${best}</div>
            </div>
            <div class="ats-summary-card">
                <div class="ats-summary-label">Overall Trend</div>
                <div class="ats-summary-value ${trend >= 0 ? "excellent" : "poor"}">${trendTxt}</div>
            </div>
        </div>
        <div class="ats-chart-wrapper">
            <div class="chart-header">
                <div class="chart-title">📈 Score Progress Over Time</div>
                <div class="chart-legend">
                    <div class="legend-item"><div class="legend-dot excellent"></div>Excellent (80+)</div>
                    <div class="legend-item"><div class="legend-dot good"></div>Good (60–79)</div>
                    <div class="legend-item"><div class="legend-dot average"></div>Average (40–59)</div>
                    <div class="legend-item"><div class="legend-dot poor"></div>Poor (&lt;40)</div>
                </div>
            </div>
            <svg class="ats-chart" id="atsChart"></svg>
        </div>
        <div class="ats-timeline" id="atsTimeline"></div>`;

    // Double rAF ensures clientWidth is available after paint
    requestAnimationFrame(() => requestAnimationFrame(() => {
        drawChart(chronological);
        drawTimeline(chronological);
    }));
}

// ── Smooth SVG chart ──────────────────────────────────────
function drawChart(scores) {
    const svg = document.getElementById("atsChart");
    if (!svg) return;

    const W   = svg.clientWidth || 600;
    const H   = 280;
    const PAD = { top: 28, right: 28, bottom: 38, left: 48 };
    const cW  = W - PAD.left - PAD.right;
    const cH  = H - PAD.top  - PAD.bottom;

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);

    let markup = `
    <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#10B981" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
        </linearGradient>
    </defs>`;

    // Score band backgrounds
    [{ from:80,to:100,c:"rgba(16,185,129,0.04)"},{from:60,to:80,c:"rgba(29,78,216,0.04)"},
     { from:40,to:60, c:"rgba(217,119,6,0.04)"},{from:0, to:40,c:"rgba(220,38,38,0.04)"}]
    .forEach(b => {
        const y1 = PAD.top + cH - (b.to   / 100) * cH;
        const y2 = PAD.top + cH - (b.from / 100) * cH;
        markup += `<rect x="${PAD.left}" y="${y1}" width="${cW}" height="${y2-y1}" fill="${b.c}"/>`;
    });

    // Grid + Y labels
    [0,25,50,75,100].forEach(val => {
        const y = PAD.top + cH - (val / 100) * cH;
        markup += `
        <line x1="${PAD.left}" y1="${y}" x2="${W-PAD.right}" y2="${y}"
              stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4 4"/>
        <text x="${PAD.left-10}" y="${y+4}" text-anchor="end"
              font-size="11" fill="#9CA3AF" font-family="JetBrains Mono,monospace">${val}</text>`;
    });

    // Coordinate points
    // When multiple points share the same date, spread them evenly across the axis
    const step = scores.length > 1 ? cW / (scores.length - 1) : 0;
    const pts  = scores.map((s, i) => ({
        x:     scores.length === 1 ? PAD.left + cW / 2 : PAD.left + i * step,
        y:     PAD.top + cH - (Math.min(100, Math.max(0, s.score)) / 100) * cH,
        score: s.score,
        // Show time (HH:MM) if multiple entries on same date, else show date
        date:  (() => {
            const d    = new Date(s.timestamp);
            const same = scores.filter(o =>
                new Date(o.timestamp).toDateString() === d.toDateString()
            ).length > 1;
            return same
                ? d.toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
                : d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
        })(),
    }));

    // X labels — max 8, sampled to avoid overlap
    const maxLbl  = Math.min(8, pts.length);
    const lblStep = Math.max(1, Math.floor(pts.length / maxLbl));
    pts.forEach((p, i) => {
        if (i % lblStep === 0 || i === pts.length - 1)
            markup += `<text x="${p.x}" y="${H-6}" text-anchor="middle"
                             font-size="10" fill="#9CA3AF"
                             font-family="JetBrains Mono,monospace">${p.date}</text>`;
    });

    if (pts.length === 1) {
        // Single data point — just a dot
        const p = pts[0];
        markup += `<circle cx="${p.x}" cy="${p.y}" r="7"
                           fill="${scoreColour(p.score)}" stroke="white" stroke-width="2.5">
                       <title>Score: ${p.score}  •  ${p.date}</title>
                   </circle>`;
    } else {
        // Smooth cubic bezier path
        const lineD = smoothPath(pts);
        const areaD = lineD
            + ` L ${pts[pts.length-1].x} ${PAD.top+cH}`
            + ` L ${pts[0].x} ${PAD.top+cH} Z`;

        markup += `<path d="${areaD}" fill="url(#areaGrad)"/>`;
        markup += `<path d="${lineD}" fill="none" stroke="#10B981" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round"/>`;
        pts.forEach(p => {
            markup += `<circle cx="${p.x}" cy="${p.y}" r="5"
                               fill="${scoreColour(p.score)}" stroke="white" stroke-width="2.5">
                           <title>Score: ${p.score}  •  ${p.date}</title>
                       </circle>`;
        });
    }

    svg.innerHTML = markup;
}

// Cubic bezier smooth path
function smoothPath(pts) {
    if (pts.length < 2) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const pr = pts[i-1], cu = pts[i];
        const cx = (pr.x + cu.x) / 2;
        d += ` C ${cx} ${pr.y}, ${cx} ${cu.y}, ${cu.x} ${cu.y}`;
    }
    return d;
}

// ── ATS Timeline ──────────────────────────────────────────
function drawTimeline(scores) {
    const el = document.getElementById("atsTimeline");
    if (!el) return;

    const reversed = [...scores].reverse().slice(0, 10);
    el.innerHTML = reversed.map((s, i) => {
        const cls      = scoreClass(s.score);
        const timeAgo  = getTimeAgo(new Date(s.timestamp));
        const fullDate = new Date(s.timestamp).toLocaleString("en-US", {
            month:"short", day:"numeric", year:"numeric",
            hour:"2-digit", minute:"2-digit",
        });
        // Delta vs previous chronological entry
        const next = reversed[i + 1];
        let deltaHtml = "";
        if (next) {
            const delta = s.score - next.score;
            const sign  = delta > 0 ? "+" : "";
            const col   = delta > 0 ? "#059669" : delta < 0 ? "#DC2626" : "#6B7280";
            deltaHtml = `<span style="color:${col};font-weight:700;font-family:'JetBrains Mono',monospace;">${sign}${delta}</span>`;
        }

        return `
        <div class="timeline-item ${cls}">
            <div class="timeline-score ${cls}">
                <div>${s.score}</div>
                <div class="timeline-score-label">${scoreLabel(s.score)}</div>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${escHtml(s.title || "ATS Analysis")}</div>
                <div class="timeline-description">${escHtml(s.description || "")}</div>
                <div class="timeline-meta">
                    <span>📅 ${fullDate}</span>
                    <span>⏱️ ${timeAgo}</span>
                    <span class="timeline-badge">${scoreEmoji(s.score)} ${scoreLabel(s.score)}</span>
                    ${deltaHtml ? `<span>Δ ${deltaHtml} vs prev</span>` : ""}
                </div>
            </div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════
// BERT SESSION CLUSTERS
// ═══════════════════════════════════════════════════════════
function displaySessionClusters(clusters) {
    const container = document.getElementById("sessionClusters");
    const section   = container && container.closest(".section");
    if (!container) return;

    if (!clusters || clusters.length === 0) {
        if (section) section.style.display = "none";
        return;
    }
    if (section) section.style.display = "block";

    const ICONS = {
        "Full Resume Review Session":    "🔬",
        "Resume & ATS Session":          "📄",
        "Resume Deep Analysis Session":  "🧠",
        "Career Intelligence Session":   "🧬",
        "Job Search & Planning Session": "💼",
        "ATS Optimisation Session":      "✅",
        "NLP Analysis Session":          "🧠",
        "Career Planning Session":       "🎯",
        "Job Discovery Session":         "🔍",
        "Career Activity Session":       "📊",
    };

    container.innerHTML = clusters.map(c => {
        const icon    = ICONS[c.label] || "📊";
        const start   = new Date(c.start).toLocaleString("en-US", {
            month:"short", day:"numeric", hour:"2-digit", minute:"2-digit",
        });
        const types   = c.types.map(t =>
            `<span class="meta-chip chip-neutral">${labelType(t)}</span>`).join(" ");
        const atsAvg  = c.atsScores && c.atsScores.length
            ? Math.round(c.atsScores.reduce((s,n) => s+n, 0) / c.atsScores.length)
            : null;

        return `
        <div class="session-cluster">
            <div class="session-icon">${icon}</div>
            <div class="session-content">
                <div class="session-label">${escHtml(c.label)}</div>
                <div class="session-meta">
                    ${c.activities} activities · ${c.timeSpanMin} min · ${start}
                    ${atsAvg !== null ? ` · Avg ATS <strong>${atsAvg}</strong>` : ""}
                </div>
                <div style="margin-top:6px;">${types}</div>
            </div>
            <div class="session-badge">🧠 BERT</div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════
// CLEAR HISTORY
// ═══════════════════════════════════════════════════════════
async function clearHistory() {
    if (!confirm("Clear your activity and login history? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
        const res  = await fetch(`${API_BASE}/history/clear`, {
            method:"DELETE",
            headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed");
        await loadHistory();
    } catch (err) {
        alert("Failed to clear history: " + err.message);
    }
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function scoreClass(n)  { return n>=80?"excellent":n>=60?"good":n>=40?"average":"poor"; }
function scoreColour(n) { return n>=80?"#059669":n>=60?"#1D4ED8":n>=40?"#D97706":"#DC2626"; }
function scoreLabel(n)  { return n>=80?"Excellent":n>=60?"Good":n>=40?"Average":"Needs Work"; }
function scoreEmoji(n)  { return n>=80?"🎉":n>=60?"👍":n>=40?"📝":"⚠️"; }

const ACTIVITY_ICONS = {
    resume_upload:"📤", upload:"📤", resume:"📄",
    ats_check:"✅", ats:"✅",
    nlp_analysis:"🧠", nlp:"🧠",
    career_dna:"🧬", login:"🔐",
    readiness:"🎯", skill_gap:"🎯",
    job_match:"💼", profile_update:"👤", other:"📌",
};
const ACTIVITY_COLORS = {
    resume_upload:"#10B981", upload:"#10B981", resume:"#10B981",
    ats_check:"#06B6D4", ats:"#06B6D4",
    nlp_analysis:"#6366F1", nlp:"#6366F1",
    career_dna:"#A78BFA", login:"#8B5CF6",
    readiness:"#F59E0B", skill_gap:"#F59E0B",
    job_match:"#3B82F6", profile_update:"#3B82F6", other:"#6B7280",
};
const ACTIVITY_LABELS = {
    resume_upload:"Resume Upload", upload:"Resume Upload", resume:"Resume Upload",
    ats_check:"ATS Check", ats:"ATS Check",
    nlp_analysis:"NLP Analysis", nlp:"NLP Analysis",
    career_dna:"Career DNA", login:"Login",
    readiness:"Readiness Score", skill_gap:"Skill Gap Analysis",
    job_match:"Job Match", profile_update:"Profile Update", other:"Activity",
};

function getActivityIcon(t)  { return ACTIVITY_ICONS[t]  ?? ACTIVITY_ICONS.other; }
function getActivityColor(t) { return ACTIVITY_COLORS[t] ?? ACTIVITY_COLORS.other; }
function labelType(t)        { return ACTIVITY_LABELS[t] ?? capitalise((t||"Activity").replace(/_/g," ")); }

function getTimeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60)      return "just now";
    if (s < 3600)    { const m=Math.floor(s/60);    return `${m} min${m===1?"":"s"} ago`; }
    if (s < 86400)   { const h=Math.floor(s/3600);  return `${h} hr${h===1?"":"s"} ago`; }
    if (s < 604800)  { const d=Math.floor(s/86400); return `${d} day${d===1?"":"s"} ago`; }
    if (s < 2592000) { const w=Math.floor(s/604800);return `${w} week${w===1?"":"s"} ago`; }
    const mo = Math.floor(s/2592000);
    return `${mo} month${mo===1?"":"s"} ago`;
}

function getDeviceInfo(ua) {
    if (!ua) return "Unknown device";
    if (/iPhone|iPad/.test(ua))     return "iOS Device";
    if (/Android/.test(ua))         return "Android Device";
    if (/Windows/.test(ua))         return "Windows PC";
    if (/Macintosh|Mac OS/.test(ua))return "Mac";
    if (/Linux/.test(ua))           return "Linux";
    return "Unknown device";
}

function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
function capitalise(s)    { return s ? s.charAt(0).toUpperCase()+s.slice(1) : ""; }
function escHtml(s)       {
    return String(s??"")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function emptyState(icon,title,text) {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div>
            <div class="empty-title">${title}</div><div class="empty-text">${text}</div></div>`;
}
function setLoadingAll(on) {
    ["activityList","loginList","atsGraphContainer","sessionClusters"].forEach(id => {
        const el=document.getElementById(id);
        if(!el||!on) return;
        el.innerHTML=`<div class="loading"><div class="spinner"></div>
                      <p style="margin-top:14px;color:#6B7280;">Loading…</p></div>`;
    });
}
function showError(msg) {
    ["activityList","loginList","atsGraphContainer"].forEach(id => {
        const el=document.getElementById(id);
        if(el) el.innerHTML=emptyState("⚠️","Something went wrong",escHtml(msg));
    });
}