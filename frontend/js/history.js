// frontend/js/history.js
// Single source of truth for the Activity History page
// Fetches from /api/history/my-history (historyController)

const API_BASE = "http://localhost:5000/api";
let historyData  = null;

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html";
        return;
    }
    loadHistory();
});

// ═══════════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════════
async function loadHistory() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login.html"; return; }

    setLoadingAll(true);

    try {
        const res  = await fetch(`${API_BASE}/history/my-history`, {
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

    } catch (err) {
        showError("Failed to load history: " + err.message);
    }
}

// Public alias so the Refresh button in HTML can call it
window.loadUserData = loadHistory;

// ═══════════════════════════════════════════════════════════════
// STATS CARDS
// ═══════════════════════════════════════════════════════════════
function displayStats(stats) {
    if (!stats) return;
    setText("totalLogins",    stats.totalLogins    ?? 0);
    setText("atsChecks",      stats.atsChecks       ?? 0);
    setText("latestAtsScore", stats.latestAtsScore  || "—");
    setText("avgAtsScore",    stats.avgAtsScore     ?? 0);
    setText("bestAtsScore",   stats.bestAtsScore    ?? 0);
    setText("readinessScore", stats.readinessScore  ?? 0);
    setText("loginsToday",    stats.loginsToday     ?? 0);
    setText("resumeUploads",  stats.resumeUploads   ?? 0);
}

// ═══════════════════════════════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════════════════════════════
function displayActivities(activities) {
    const container = document.getElementById("activityList");
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = emptyState("📭", "No Recent Activity", "Start using the platform to see your activity here");
        return;
    }

    container.innerHTML = activities.map(a => {
        const icon    = getActivityIcon(a.type);
        const color   = getActivityColor(a.type);
        const timeAgo = getTimeAgo(new Date(a.timestamp));
        const statusCls = a.status === "success" ? "status-success"
                        : a.status === "error"   ? "status-failed"
                        : "status-pending";

        return `
        <div class="activity-item">
            <div class="activity-icon" style="color:${color}">${icon}</div>
            <div class="activity-content">
                <div class="activity-title">${escHtml(a.title || a.type)}</div>
                <div class="activity-description">${escHtml(a.description || "")}</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
            <span class="activity-status ${statusCls}">
                ${a.status === "success" ? "✓" : "○"} ${capitalise(a.status || "completed")}
            </span>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════════
// LOGIN HISTORY
// ═══════════════════════════════════════════════════════════════
function displayLogins(logins) {
    const container = document.getElementById("loginList");
    if (!container) return;

    if (!logins || logins.length === 0) {
        container.innerHTML = emptyState("🔐", "No Login History", "Your login sessions will appear here");
        return;
    }

    container.innerHTML = logins.map(l => {
        const date    = new Date(l.timestamp);
        const timeAgo = getTimeAgo(date);
        const fullDate = date.toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

        return `
        <div class="login-item">
            <div class="login-icon">🔐</div>
            <div class="login-content">
                <div class="login-time">${fullDate}</div>
                ${l.ipAddress ? `<div class="login-details">📍 ${escHtml(l.ipAddress)}</div>` : ""}
                ${l.userAgent ? `<div class="login-details">💻 ${escHtml(getDeviceInfo(l.userAgent))}</div>` : ""}
            </div>
            <div class="login-ago">${timeAgo}</div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════════
// ATS SECTION — summary + SVG line chart + timeline
// ═══════════════════════════════════════════════════════════════
function displayAtsSection(atsHistory) {
    const container = document.getElementById("atsGraphContainer");
    if (!container) return;

    if (!atsHistory || atsHistory.length === 0) {
        container.innerHTML = emptyState("📊", "No ATS Data Yet", "Upload a resume to see your ATS score analytics");
        return;
    }

    const scores  = [...atsHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const vals    = scores.map(s => s.score);
    const latest  = vals[vals.length - 1];
    const avg     = Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
    const best    = Math.max(...vals);
    const trend   = vals.length > 1 ? latest - vals[0] : 0;
    const trendIcon = trend > 0 ? "📈" : trend < 0 ? "📉" : "➡️";
    const trendSign = trend >= 0 ? "+" : "";

    container.innerHTML = `
        <!-- Summary Cards -->
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
                <div class="ats-summary-label">Trend</div>
                <div class="ats-summary-value ${trend >= 0 ? "excellent" : "poor"}">${trendIcon} ${trendSign}${trend}</div>
            </div>
        </div>

        <!-- Chart -->
        <div class="ats-chart-wrapper">
            <div class="chart-header">
                <div class="chart-title">📈 Score Progress Over Time</div>
                <div class="chart-legend">
                    <div class="legend-item"><div class="legend-dot excellent"></div> Excellent (80+)</div>
                    <div class="legend-item"><div class="legend-dot good"></div> Good (60-79)</div>
                    <div class="legend-item"><div class="legend-dot average"></div> Average (40-59)</div>
                    <div class="legend-item"><div class="legend-dot poor"></div> Poor (&lt;40)</div>
                </div>
            </div>
            <svg class="ats-chart" id="atsChart"></svg>
        </div>

        <!-- Timeline -->
        <div class="ats-timeline" id="atsTimeline"></div>
    `;

    // Render after DOM update
    requestAnimationFrame(() => {
        drawChart(scores);
        drawTimeline(scores);
    });
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function drawChart(scores) {
    const svg     = document.getElementById("atsChart");
    if (!svg) return;

    const W       = svg.clientWidth  || 600;
    const H       = 280;
    const PAD     = { top: 24, right: 24, bottom: 32, left: 44 };
    const cW      = W - PAD.left - PAD.right;
    const cH      = H - PAD.top  - PAD.bottom;

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";

    // Defs — gradient fill
    svg.innerHTML = `
    <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#10B981" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
        </linearGradient>
    </defs>`;

    // Grid lines + Y labels
    const YTICKS = [0, 25, 50, 75, 100];
    YTICKS.forEach(val => {
        const y = PAD.top + cH - (val / 100) * cH;
        svg.innerHTML += `
            <line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}"
                  stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4 4"/>
            <text x="${PAD.left - 8}" y="${y + 4}" text-anchor="end"
                  font-size="11" fill="#6B7280">${val}</text>`;
    });

    // X labels (every score point)
    const step = scores.length > 1 ? cW / (scores.length - 1) : 0;
    scores.forEach((s, i) => {
        const x   = PAD.left + i * step;
        const lbl = new Date(s.timestamp).toLocaleDateString("en-US", { month:"short", day:"numeric" });
        svg.innerHTML += `
            <text x="${x}" y="${H - 6}" text-anchor="middle"
                  font-size="10" fill="#9CA3AF">${lbl}</text>`;
    });

    // Build coordinate list
    const pts = scores.map((s, i) => ({
        x: PAD.left + i * step,
        y: PAD.top + cH - (s.score / 100) * cH,
        score: s.score,
        date: new Date(s.timestamp).toLocaleDateString(),
    }));

    // Area path
    if (pts.length > 1) {
        const aD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
        const last = pts[pts.length - 1];
        svg.innerHTML += `
            <path d="${aD} L ${last.x} ${PAD.top + cH} L ${pts[0].x} ${PAD.top + cH} Z"
                  fill="url(#areaGrad)"/>`;
        // Line
        svg.innerHTML += `
            <path d="${aD}" fill="none" stroke="#10B981" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>`;
    }

    // Dots + tooltips
    pts.forEach(p => {
        svg.innerHTML += `
            <circle cx="${p.x}" cy="${p.y}" r="5"
                    fill="${scoreColour(p.score)}" stroke="white" stroke-width="2">
                <title>Score: ${p.score}  •  ${p.date}</title>
            </circle>`;
    });
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function drawTimeline(scores) {
    const el = document.getElementById("atsTimeline");
    if (!el) return;

    el.innerHTML = [...scores].reverse().slice(0, 10).map(s => {
        const cls     = scoreClass(s.score);
        const timeAgo = getTimeAgo(new Date(s.timestamp));
        const fullDate = new Date(s.timestamp).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });

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
                </div>
            </div>
        </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════════════════
// CLEAR HISTORY
// ═══════════════════════════════════════════════════════════════
async function clearHistory() {
    if (!confirm("Clear your activity and login history? This cannot be undone.")) return;

    const token = localStorage.getItem("token");
    try {
        const res  = await fetch(`${API_BASE}/history/clear`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed");
        await loadHistory();
    } catch (err) {
        alert("Failed to clear history: " + err.message);
    }
}

window.clearHistory = clearHistory;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function scoreClass(n) {
    return n >= 80 ? "excellent" : n >= 60 ? "good" : n >= 40 ? "average" : "poor";
}
function scoreColour(n) {
    return n >= 80 ? "#059669" : n >= 60 ? "#1D4ED8" : n >= 40 ? "#D97706" : "#DC2626";
}
function scoreLabel(n) {
    return n >= 80 ? "Excellent" : n >= 60 ? "Good" : n >= 40 ? "Average" : "Needs Work";
}
function scoreEmoji(n) {
    return n >= 80 ? "🎉" : n >= 60 ? "👍" : n >= 40 ? "📝" : "⚠️";
}

// All activity types the backend ever saves
const ACTIVITY_ICONS = {
    resume_upload:  "📤",
    upload:         "📤",
    resume:         "📄",
    ats_check:      "✅",
    ats:            "✅",
    nlp_analysis:   "🧠",
    nlp:            "🧠",
    career_dna:     "🧬",
    login:          "🔐",
    readiness:      "🎯",
    profile_update: "👤",
    other:          "📌",
};

const ACTIVITY_COLORS = {
    resume_upload:  "#10B981",
    upload:         "#10B981",
    resume:         "#10B981",
    ats_check:      "#06B6D4",
    ats:            "#06B6D4",
    nlp_analysis:   "#6366F1",
    nlp:            "#6366F1",
    career_dna:     "#A78BFA",
    login:          "#8B5CF6",
    readiness:      "#F59E0B",
    profile_update: "#3B82F6",
    other:          "#6B7280",
};

function getActivityIcon(type)  { return ACTIVITY_ICONS[type]  || ACTIVITY_ICONS.other; }
function getActivityColor(type) { return ACTIVITY_COLORS[type] || ACTIVITY_COLORS.other; }

function getTimeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60)       return "just now";
    if (s < 3600)     return `${Math.floor(s / 60)} min${s < 120 ? "" : "s"} ago`;
    if (s < 86400)    return `${Math.floor(s / 3600)} hr${s < 7200 ? "" : "s"} ago`;
    if (s < 604800)   return `${Math.floor(s / 86400)} day${s < 172800 ? "" : "s"} ago`;
    if (s < 2592000)  return `${Math.floor(s / 604800)} week${s < 1209600 ? "" : "s"} ago`;
    return `${Math.floor(s / 2592000)} month${s < 5184000 ? "" : "s"} ago`;
}

function getDeviceInfo(ua) {
    if (!ua) return "Unknown device";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS Device";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac"))     return "Mac";
    if (ua.includes("Linux"))   return "Linux";
    return "Unknown device";
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function capitalise(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function emptyState(icon, title, text) {
    return `
    <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-title">${title}</div>
        <div class="empty-text">${text}</div>
    </div>`;
}

function setLoadingAll(on) {
    ["activityList", "loginList", "atsGraphContainer"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (on) {
            el.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p style="margin-top:14px;color:#6B7280;">Loading…</p>
            </div>`;
        }
    });
}

function showError(msg) {
    ["activityList", "loginList", "atsGraphContainer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = emptyState("⚠️", "Error", escHtml(msg));
    });
}