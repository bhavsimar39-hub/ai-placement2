/* ── Auto-load resume skills from localStorage ─────────── */
(function autoLoadSkills() {
    document.addEventListener('DOMContentLoaded', () => {
        const stored = localStorage.getItem('skills_found');
        if (!stored) return;
        try {
            const skills = JSON.parse(stored);
            if (!Array.isArray(skills) || skills.length === 0) return;
            const textarea = document.getElementById('knownSkills');
            if (!textarea || textarea.value.trim()) return; // don't overwrite manual entry
            textarea.value = skills.join(', ');
            // Trigger preview update if function exists
            if (typeof updateTagPreview === 'function') updateTagPreview();
            // Show a subtle hint
            const hint = document.getElementById('companyHint');
            if (hint && !hint.textContent) {
                hint.innerHTML = `<span style="color:#10B981;font-weight:600;">✓ ${skills.length} skills auto-loaded from your resume</span>`;
            }
        } catch(_) {}
    });
})();

// ═══════════════════════════════════════════════════════════
//  SKILL GAP ENGINE  —  Professional Edition
// ═══════════════════════════════════════════════════════════

/* ── Career Track Definitions ──────────────────────────── */
const careerTracks = {
    "web-development": {
        title: "Web Development",
        icon: "🌐",
        skills: [
            { name: "HTML / CSS",      core: true },
            { name: "JavaScript",      core: true },
            { name: "React / Vue",     core: true },
            { name: "Node.js",         core: true },
            { name: "REST APIs",       core: true },
            { name: "SQL / NoSQL",     core: false },
            { name: "Git & GitHub",    core: false },
            { name: "TypeScript",      core: false },
        ]
    },
    "machine-learning": {
        title: "Machine Learning / AI",
        icon: "🤖",
        skills: [
            { name: "Python",             core: true },
            { name: "NumPy / Pandas",     core: true },
            { name: "TensorFlow / PyTorch",core: true },
            { name: "Machine Learning",   core: true },
            { name: "Deep Learning",      core: true },
            { name: "Statistics & Math",  core: false },
            { name: "MLOps",              core: false },
            { name: "Data Pipelines",     core: false },
        ]
    },
    "data-science": {
        title: "Data Science",
        icon: "📊",
        skills: [
            { name: "Python",                  core: true },
            { name: "SQL",                     core: true },
            { name: "Pandas / NumPy",          core: true },
            { name: "Data Visualisation",      core: true },
            { name: "Statistics",              core: true },
            { name: "Machine Learning",        core: false },
            { name: "A/B Testing",             core: false },
            { name: "Tableau / PowerBI",       core: false },
        ]
    },
    "app-development": {
        title: "Mobile App Development",
        icon: "📱",
        skills: [
            { name: "Flutter / React Native", core: true },
            { name: "Dart / JavaScript",      core: true },
            { name: "REST APIs",              core: true },
            { name: "State Management",       core: true },
            { name: "UI / UX Principles",     core: false },
            { name: "iOS / Android SDKs",     core: false },
            { name: "App Store Deployment",   core: false },
            { name: "Firebase",               core: false },
        ]
    },
    "cybersecurity": {
        title: "Cybersecurity",
        icon: "🔐",
        skills: [
            { name: "Networking Fundamentals", core: true },
            { name: "Linux / Bash",            core: true },
            { name: "Ethical Hacking",         core: true },
            { name: "Threat Analysis",         core: true },
            { name: "Cryptography",            core: false },
            { name: "SIEM Tools",              core: false },
            { name: "Python Scripting",        core: false },
            { name: "Firewalls & IDS",         core: false },
        ]
    },
    "cloud": {
        title: "Cloud Engineering",
        icon: "☁️",
        skills: [
            { name: "AWS / GCP / Azure", core: true },
            { name: "Docker",            core: true },
            { name: "Kubernetes",        core: true },
            { name: "CI / CD Pipelines", core: true },
            { name: "Linux",             core: true },
            { name: "Terraform (IaC)",   core: false },
            { name: "Networking (VPC)",  core: false },
            { name: "Monitoring Tools",  core: false },
        ]
    },
    "devops": {
        title: "DevOps / SRE",
        icon: "⚙️",
        skills: [
            { name: "Linux / Bash",       core: true },
            { name: "Docker",             core: true },
            { name: "Kubernetes",         core: true },
            { name: "CI / CD (Jenkins / GitHub Actions)", core: true },
            { name: "Terraform",          core: false },
            { name: "Monitoring (Grafana / Prometheus)",  core: false },
            { name: "Python / Go Scripting", core: false },
            { name: "Cloud (AWS / GCP)",  core: false },
        ]
    },
    "ui-ux": {
        title: "UI / UX Design",
        icon: "🎨",
        skills: [
            { name: "Figma",              core: true },
            { name: "Wireframing",        core: true },
            { name: "Prototyping",        core: true },
            { name: "User Research",      core: true },
            { name: "Design Systems",     core: false },
            { name: "Usability Testing",  core: false },
            { name: "HTML / CSS (basics)",core: false },
            { name: "Motion Design",      core: false },
        ]
    },
    "backend": {
        title: "Backend Engineering",
        icon: "🖥️",
        skills: [
            { name: "Python / Java / Go",  core: true },
            { name: "REST / GraphQL APIs", core: true },
            { name: "SQL Databases",       core: true },
            { name: "System Design",       core: true },
            { name: "Caching (Redis)",     core: false },
            { name: "Message Queues",      core: false },
            { name: "Microservices",       core: false },
            { name: "Docker / Kubernetes", core: false },
        ]
    },
    "digital-marketing": {
        title: "Digital Marketing",
        icon: "📢",
        skills: [
            { name: "SEO",                  core: true },
            { name: "Google Ads / SEM",     core: true },
            { name: "Analytics (GA4)",      core: true },
            { name: "Content Strategy",     core: true },
            { name: "Social Media Marketing",core: false },
            { name: "Email Marketing",      core: false },
            { name: "CRO",                  core: false },
            { name: "A/B Testing",          core: false },
        ]
    }
};

/* ── Company → Track Mapping ───────────────────────────── */
const companyMap = {
    // Big Tech
    "google":      { track: "machine-learning", label: "Google",    emoji: "🔍", location: "Mountain View, CA" },
    "meta":        { track: "machine-learning", label: "Meta",      emoji: "👥", location: "Menlo Park, CA" },
    "facebook":    { track: "machine-learning", label: "Facebook",  emoji: "👥", location: "Menlo Park, CA" },
    "amazon":      { track: "cloud",            label: "Amazon",    emoji: "📦", location: "Seattle, WA" },
    "aws":         { track: "cloud",            label: "AWS",       emoji: "☁️", location: "Seattle, WA" },
    "microsoft":   { track: "cloud",            label: "Microsoft", emoji: "🪟", location: "Redmond, WA" },
    "apple":       { track: "app-development",  label: "Apple",     emoji: "🍎", location: "Cupertino, CA" },
    "netflix":     { track: "data-science",     label: "Netflix",   emoji: "🎬", location: "Los Gatos, CA" },
    "uber":        { track: "backend",          label: "Uber",      emoji: "🚖", location: "San Francisco, CA" },
    "airbnb":      { track: "web-development",  label: "Airbnb",    emoji: "🏠", location: "San Francisco, CA" },
    "twitter":     { track: "backend",          label: "Twitter/X", emoji: "🐦", location: "San Francisco, CA" },
    "x":           { track: "backend",          label: "X (Twitter)",emoji:"🐦", location: "San Francisco, CA" },
    "linkedin":    { track: "data-science",     label: "LinkedIn",  emoji: "💼", location: "Sunnyvale, CA" },
    "salesforce":  { track: "cloud",            label: "Salesforce",emoji: "☁️", location: "San Francisco, CA" },
    "adobe":       { track: "ui-ux",            label: "Adobe",     emoji: "🎨", location: "San Jose, CA" },
    "shopify":     { track: "web-development",  label: "Shopify",   emoji: "🛍️", location: "Ottawa, Canada" },
    "stripe":      { track: "backend",          label: "Stripe",    emoji: "💳", location: "San Francisco, CA" },
    // Indian IT
    "tcs":         { track: "web-development",  label: "TCS",       emoji: "💻", location: "Mumbai, India" },
    "infosys":     { track: "web-development",  label: "Infosys",   emoji: "💻", location: "Bengaluru, India" },
    "wipro":       { track: "cloud",            label: "Wipro",     emoji: "💻", location: "Bengaluru, India" },
    "accenture":   { track: "cybersecurity",    label: "Accenture", emoji: "🔷", location: "Dublin, Ireland" },
    "hcl":         { track: "devops",           label: "HCL Tech",  emoji: "💻", location: "Noida, India" },
    "cognizant":   { track: "web-development",  label: "Cognizant", emoji: "💻", location: "Teaneck, NJ" },
    // Consumer / Product
    "spotify":     { track: "data-science",     label: "Spotify",   emoji: "🎵", location: "Stockholm, Sweden" },
    "zomato":      { track: "app-development",  label: "Zomato",    emoji: "🍕", location: "Gurugram, India" },
    "swiggy":      { track: "app-development",  label: "Swiggy",    emoji: "🛵", location: "Bengaluru, India" },
    "razorpay":    { track: "backend",          label: "Razorpay",  emoji: "💸", location: "Bengaluru, India" },
    "paytm":       { track: "app-development",  label: "Paytm",     emoji: "💰", location: "Noida, India" },
    // More Indian companies
    "flipkart":    { track: "web-development",  label: "Flipkart",  emoji: "🛒", location: "Bengaluru, India" },
    "phonepe":     { track: "backend",          label: "PhonePe",   emoji: "📲", location: "Bengaluru, India" },
    "meesho":      { track: "web-development",  label: "Meesho",    emoji: "🛍️", location: "Bengaluru, India" },
    "cred":        { track: "app-development",  label: "CRED",      emoji: "💳", location: "Bengaluru, India" },
    "byju":        { track: "web-development",  label: "BYJU'S",    emoji: "📚", location: "Bengaluru, India" },
    "byjus":       { track: "web-development",  label: "BYJU'S",    emoji: "📚", location: "Bengaluru, India" },
    "zepto":       { track: "backend",          label: "Zepto",     emoji: "⚡", location: "Mumbai, India" },
    "groww":       { track: "app-development",  label: "Groww",     emoji: "📈", location: "Bengaluru, India" },
    "nykaa":       { track: "app-development",  label: "Nykaa",     emoji: "💄", location: "Mumbai, India" },
    "ola":         { track: "app-development",  label: "Ola",       emoji: "🚗", location: "Bengaluru, India" },
    "freshworks":  { track: "web-development",  label: "Freshworks",emoji: "💧", location: "Chennai, India" },
    "zoho":        { track: "web-development",  label: "Zoho",      emoji: "🔧", location: "Chennai, India" },
    "mphasis":     { track: "cloud",            label: "Mphasis",   emoji: "💻", location: "Bengaluru, India" },
    "tech mahindra":{ track: "devops",          label: "Tech Mahindra",emoji:"💻",location: "Pune, India" },
    "techmahindra":{ track: "devops",           label: "Tech Mahindra",emoji:"💻",location: "Pune, India" },
    "mindtree":    { track: "web-development",  label: "Mindtree",  emoji: "💻", location: "Bengaluru, India" },
    "persistent":  { track: "backend",          label: "Persistent Systems",emoji:"💻",location: "Pune, India" },
    "l&t":         { track: "cloud",            label: "L&T Technology",emoji:"⚙️",location: "Mumbai, India" },
    "lnt":         { track: "cloud",            label: "L&T Technology",emoji:"⚙️",location: "Mumbai, India" },
    "kpmg":        { track: "data-science",     label: "KPMG",      emoji: "📊", location: "Mumbai, India" },
    "deloitte":    { track: "cybersecurity",    label: "Deloitte",  emoji: "🔷", location: "Hyderabad, India" },
    "pwc":         { track: "data-science",     label: "PwC",       emoji: "📊", location: "Mumbai, India" },
    // More Global Tech
    "oracle":      { track: "backend",          label: "Oracle",    emoji: "🔴", location: "Austin, TX" },
    "sap":         { track: "cloud",            label: "SAP",       emoji: "🔵", location: "Walldorf, Germany" },
    "ibm":         { track: "cloud",            label: "IBM",       emoji: "🔵", location: "Armonk, NY" },
    "intel":       { track: "machine-learning", label: "Intel",     emoji: "🔷", location: "Santa Clara, CA" },
    "nvidia":      { track: "machine-learning", label: "NVIDIA",    emoji: "🟢", location: "Santa Clara, CA" },
    "qualcomm":    { track: "app-development",  label: "Qualcomm",  emoji: "📡", location: "San Diego, CA" },
    "tesla":       { track: "machine-learning", label: "Tesla",     emoji: "⚡", location: "Austin, TX" },
    "palantir":    { track: "data-science",     label: "Palantir",  emoji: "🔮", location: "Denver, CO" },
    "databricks":  { track: "data-science",     label: "Databricks",emoji: "🧱", location: "San Francisco, CA" },
    "snowflake":   { track: "data-science",     label: "Snowflake", emoji: "❄️", location: "Bozeman, MT" },
    "atlassian":   { track: "devops",           label: "Atlassian", emoji: "🔵", location: "Sydney, Australia" },
    "github":      { track: "devops",           label: "GitHub",    emoji: "🐙", location: "San Francisco, CA" },
    "gitlab":      { track: "devops",           label: "GitLab",    emoji: "🦊", location: "Remote" },
    "docker":      { track: "devops",           label: "Docker",    emoji: "🐳", location: "San Francisco, CA" },
    "hashicorp":   { track: "cloud",            label: "HashiCorp", emoji: "⬡", location: "San Francisco, CA" },
    "postman":     { track: "backend",          label: "Postman",   emoji: "📮", location: "San Francisco, CA" },
    "twilio":      { track: "backend",          label: "Twilio",    emoji: "📞", location: "San Francisco, CA" },
    "cloudflare":  { track: "cloud",            label: "Cloudflare",emoji: "🌥️", location: "San Francisco, CA" },
    "figma":       { track: "ui-ux",            label: "Figma",     emoji: "🎨", location: "San Francisco, CA" },
    "notion":      { track: "web-development",  label: "Notion",    emoji: "📝", location: "San Francisco, CA" },
    "slack":       { track: "backend",          label: "Slack",     emoji: "💬", location: "San Francisco, CA" },
    "zoom":        { track: "backend",          label: "Zoom",      emoji: "📹", location: "San Jose, CA" },
    "coinbase":    { track: "backend",          label: "Coinbase",  emoji: "🪙", location: "San Francisco, CA" },
};

/* ── Company hint with fuzzy matching ──────────────────── */
function findCompany(val) {
    if (!val) return null;
    const v = val.toLowerCase().trim();
    // Exact match
    if (companyMap[v]) return companyMap[v];
    // Partial match — company name starts with input or input starts with company key
    for (const [key, info] of Object.entries(companyMap)) {
        if (key.startsWith(v) || v.startsWith(key) ||
            info.label.toLowerCase().includes(v) || v.includes(key)) {
            return info;
        }
    }
    return null;
}

function updateCompanyHint() {
    const val = document.getElementById("companyInput").value.trim();
    const hint = document.getElementById("companyHint");
    if (!val) { hint.textContent = ""; return; }
    const found = findCompany(val);
    if (found) {
        const track = careerTracks[found.track];
        hint.innerHTML = `<span style="color:#10B981;font-weight:700">✓ ${found.label} detected → ${track.icon} ${track.title}</span>`;
    } else if (val.length >= 3) {
        hint.innerHTML = `<span style="color:#9CA3AF">Not in database — select a career track manually</span>`;
    } else {
        hint.textContent = "";
    }
}

/* ── Main Analyze Function ──────────────────────────────── */
function analyzeGap() {
    const companyRaw = document.getElementById("companyInput").value.trim();
    const companyKey = companyRaw.toLowerCase();
    const trackOverride = document.getElementById("trackOverride").value;
    const knownRaw = document.getElementById("knownSkills").value;

    if (!companyRaw && !trackOverride) {
        alert("Please enter a company name or select a career track.");
        return;
    }

    // Determine track — use fuzzy findCompany for better matching
    let trackKey, companyInfo;
    if (trackOverride) {
        trackKey    = trackOverride;
        companyInfo = findCompany(companyRaw) || null;
    } else {
        companyInfo = findCompany(companyRaw);
        if (companyInfo) {
            trackKey = companyInfo.track;
        } else {
            // Show inline error instead of alert
            const hint = document.getElementById("companyHint");
            hint.innerHTML = `<span style="color:#EF4444;font-weight:700">⚠ Company not found. Please select a Career Track from the dropdown above.</span>`;
            document.getElementById("trackOverride").style.borderColor = "#EF4444";
            document.getElementById("trackOverride").focus();
            return;
        }
    }
    // Reset any error state
    document.getElementById("trackOverride").style.borderColor = "";

    // Show loading
    document.getElementById("loadingOverlay").classList.add("active");
    document.getElementById("analyzeBtn").disabled = true;

    setTimeout(async () => {
        document.getElementById("loadingOverlay").classList.remove("active");
        document.getElementById("analyzeBtn").disabled = false;

        const knownList = knownRaw.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
        const track = careerTracks[trackKey];
        const required = track.skills;

        // Match skills (flexible matching)
        const matched = required.map(s => {
            const skillLower = s.name.toLowerCase();
            const have = knownList.some(k =>
                skillLower.includes(k) || k.includes(skillLower) ||
                skillLower.split("/").some(part => k.includes(part.trim()) || part.trim().includes(k))
            );
            return { ...s, have };
        });

        const haveCount = matched.filter(s => s.have).length;
        const missCount = matched.filter(s => !s.have).length;
        const total     = matched.length;
        const pct       = Math.round((haveCount / total) * 100);

        renderScore(pct);
        renderCompanyPanel(companyInfo, companyRaw, track, haveCount, missCount, total, pct);
        renderSkillBreakdown(matched, companyRaw, track);
        renderRecommendations(matched, track, pct);

        document.getElementById("emptyPanel").style.display = "none";
        document.getElementById("resultsSection").classList.add("active");
        setTimeout(() => {
            document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);

        // Save to localStorage for dashboard
        localStorage.setItem('skill_gap_score',   pct);
        localStorage.setItem('skill_gap_track',   track.title);
        localStorage.setItem('skill_gap_missing', matched.filter(s => !s.have).length);
        localStorage.setItem('skills_missing',    JSON.stringify(matched.filter(s => !s.have).map(s => s.name)));
        localStorage.setItem('readiness_score',   pct);

        // ── Call backend for BERT semantic matching ─────
        const token = localStorage.getItem('token');
        if (token) {
            const requiredNames = required.map(s => s.name);
            const knownNames    = knownRaw.split(',').map(s => s.trim()).filter(Boolean);
            try {
                const bertRes = await fetch('http://localhost:5000/api/skills/gap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userSkills:    knownNames,
                        requiredSkills: requiredNames,
                        trackTitle:    track.title,
                        companyName:   companyInfo ? companyInfo.label : companyRaw,
                    })
                });
                if (bertRes.ok) {
                    const bertData = await bertRes.json();
                    if (bertData.success) {
                        // ── NLP career insights (always show if Groq returned them) ──
                        if (bertData.nlpInsights) {
                            renderNLPInsights(bertData.nlpInsights, track);
                        }

                        if (bertData.bertUsed) {
                            // BERT found extra semantic matches — upgrade the UI
                            renderBertInsights(bertData, track);

                            // Update score with BERT-enhanced result
                            const bertPct = bertData.readinessScore;
                            renderScore(bertPct);
                            localStorage.setItem('skill_gap_score',   bertPct);
                            localStorage.setItem('skill_gap_missing', bertData.missingCount);
                            localStorage.setItem('readiness_score',   bertPct);
                        }
                    }
                }
            } catch(_) { /* BERT unavailable — keep existing results */ }
        }
    }, 1400);
}

/* ── Score Ring ─────────────────────────────────────────── */
function renderScore(pct) {
    const C = 2 * Math.PI * 80;          // r = 80 matches SVG
    const ring = document.getElementById("ringProgress");
    ring.style.strokeDasharray  = C;
    ring.style.strokeDashoffset = C - (pct / 100) * C;

    document.getElementById("matchPct").textContent = pct;
    document.getElementById("matchPct").classList.remove("idle"); // show full-size number
    // Show "% Match" label only after analysis
    document.getElementById("matchSub").classList.add("show");

    let pillCls = "pill-low", label = "Needs Work", ringCls = "ring-low";
    if (pct >= 85)      { pillCls = "pill-great";   label = "Job Ready 🔥";     ringCls = "ring-great"; }
    else if (pct >= 65) { pillCls = "pill-good";     label = "Strong Match 👍"; ringCls = "ring-good"; }
    else if (pct >= 40) { pillCls = "pill-average";  label = "Average ⚡";      ringCls = "ring-avg"; }
    const ringEl = document.getElementById("ringProgress");
    ringEl.className = "ring-fill " + ringCls;

    const pill = document.getElementById("readinessPill");
    pill.className = "readiness-pill " + pillCls;
    pill.textContent = label;
}

/* ── Company Panel ──────────────────────────────────────── */
function renderCompanyPanel(info, raw, track, have, miss, total, pct) {
    document.getElementById("companyBadgeWrap").style.display = "block";
    document.getElementById("panelStats").style.display = "grid";

    document.getElementById("companyEmoji").textContent       = info ? info.emoji : "🏢";
    document.getElementById("companyNameDisplay").textContent = info ? info.label : raw;
    document.getElementById("trackDisplay").textContent       = track.title;

    document.getElementById("statHave").textContent  = have;
    document.getElementById("statMiss").textContent  = miss;
    document.getElementById("statTotal").textContent = total;

    const weeks = miss <= 1 ? "< 2 weeks" : miss <= 3 ? "1 – 2 months" : miss <= 5 ? "2 – 4 months" : "4 – 6 months";
    document.getElementById("statTime").textContent = weeks;
}

/* ── Skill Breakdown ────────────────────────────────────── */
function renderSkillBreakdown(matched, company, track) {
    document.getElementById("skillBreakdownCard").style.display = "block";
    document.getElementById("breakdownTitle").textContent = `${track.title} — Skill Breakdown`;

    const haveItems = matched.filter(s => s.have);
    const missItems = matched.filter(s => !s.have);

    let html = "";

    if (haveItems.length) {
        html += `<div class="section-lbl">✅ Skills You Have (${haveItems.length})</div>`;
        html += `<div class="tag-grid" style="margin-bottom:24px;">`;
        haveItems.forEach(s => {
            html += `<span class="tag tag-have"><span class="tag-dot"></span>${s.name}</span>`;
        });
        html += `</div>`;
    }

    if (missItems.length) {
        html += `<div class="section-lbl">❌ Skills You're Missing (${missItems.length})</div>`;
        html += `<div class="tag-grid" style="margin-bottom:24px;">`;
        missItems.forEach(s => {
            html += `<span class="tag tag-miss"><span class="tag-dot"></span>${s.name}${s.core ? ' <small style="opacity:.6">core</small>' : ''}</span>`;
        });
        html += `</div>`;
    }

    // Full skill bar chart
    html += `<div class="section-lbl">📋 All Required Skills</div>`;
    matched.forEach(s => {
        const fillPct = s.have ? 100 : 20;
        const fillClass = s.have ? "fill-have" : "fill-miss";
        const statusClass = s.have ? "s-have" : "s-miss";
        const statusLabel = s.have ? "✓ Have" : "Missing";
        html += `
            <div class="skill-row">
                <div class="skill-row-left">
                    <div class="skill-name-row">${s.name}${s.core ? ' <span class="core-badge">core</span>' : ''}</div>
                    <div class="skill-track"><div class="skill-fill ${fillClass}" style="width:0%" data-w="${fillPct}%"></div></div>
                </div>
                <span class="skill-status ${statusClass}">${statusLabel}</span>
            </div>`;
    });

    document.getElementById("skillBreakdownBody").innerHTML = html;
    // Animate skill fill bars
    requestAnimationFrame(() => {
        document.querySelectorAll(".skill-fill[data-w]").forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.dataset.w; }, 100 + i * 60);
        });
    });
}

/* ── Action Plan / Recommendations ─────────────────────── */
function renderRecommendations(matched, track, pct) {
    document.getElementById("recsCard").style.display = "block";

    const missing = matched.filter(s => !s.have);
    const coreMissing = missing.filter(s => s.core);
    const niceMissing = missing.filter(s => !s.core);

    const recs = [];

    if (coreMissing.length) {
        recs.push(`Start with the <strong>core missing skills</strong>: ${coreMissing.map(s=>s.name).join(", ")}. These are non-negotiable for this role.`);
    }
    if (niceMissing.length) {
        recs.push(`Then build supporting skills: <strong>${niceMissing.map(s=>s.name).join(", ")}</strong>. These give you a competitive edge over other candidates.`);
    }
    if (pct < 60) {
        recs.push(`With ${100 - pct}% gap remaining, dedicate <strong>2–3 hours daily</strong> to structured learning. Build 2 portfolio projects to demonstrate progress.`);
    }
    if (pct >= 60 && pct < 85) {
        recs.push(`You're <strong>close to job-ready</strong>. Polish your existing skills and add 1–2 advanced projects to stand out in interviews.`);
    }
    if (pct >= 85) {
        recs.push(`🎉 You're <strong>highly competitive</strong> for this role! Focus on system design, mock interviews, and optimising your resume and portfolio.`);
    }
    recs.push(`Earn a recognised <strong>certification</strong> in ${track.title} — it signals credibility to recruiters and ATS systems.`);
    recs.push(`Build a <strong>GitHub portfolio</strong> with at least 3 projects showcasing the required skills. Quantity and quality both matter.`);

    document.getElementById("recsList").innerHTML = recs.map((r, i) =>
        `<div class="rec-row"><div class="rec-num">${i + 1}</div><div class="rec-text">${r}</div></div>`
    ).join("");
}


/* ── Groq NLP Career Insights Panel ─────────────────────── */
function renderNLPInsights(nlp, track) {
    let panel = document.getElementById('nlpInsightsPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'nlpInsightsPanel';
        panel.style.cssText = 'margin-top:24px;';
        // Insert after bertInsightsPanel if it exists, otherwise after recsCard
        const anchor = document.getElementById('bertInsightsPanel') || document.getElementById('recsCard');
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    }

    if (!nlp) return;

    const hasPriority = nlp.prioritySkills && nlp.prioritySkills.length > 0;

    // Build priority skill cards
    let priorityHTML = '';
    if (hasPriority) {
        priorityHTML = `
        <div style="margin-bottom:18px;">
            <div style="font-size:11px;font-weight:700;color:#065F46;text-transform:uppercase;
                        letter-spacing:1.2px;margin-bottom:10px;">🎯 Priority Learning Path</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${nlp.prioritySkills.map((p, i) => `
                    <div style="background:white;border:1px solid #A7F3D0;border-radius:10px;
                                padding:12px 14px;display:flex;align-items:flex-start;gap:12px;">
                        <div style="background:linear-gradient(135deg,#10B981,#059669);color:white;
                                    border-radius:8px;width:26px;height:26px;display:flex;align-items:center;
                                    justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">
                            ${i + 1}
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:700;font-size:13px;color:#111827;margin-bottom:3px;">
                                ${p.skill}
                                <span style="background:#D1FAE5;color:#065F46;padding:2px 8px;border-radius:10px;
                                             font-size:10px;font-weight:700;margin-left:6px;">
                                    ~${p.estimatedWeeks}w
                                </span>
                            </div>
                            <div style="font-size:12px;color:#6B7280;line-height:1.5;">${p.reason}</div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
    }

    // Build insight chips row
    const chips = [
        nlp.strengthsSummary  && { icon: '💪', label: 'Your Strengths',   text: nlp.strengthsSummary,  color: '#059669', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)'  },
        nlp.marketInsight     && { icon: '📈', label: 'Market Reality',   text: nlp.marketInsight,     color: '#2563EB', bg: 'rgba(37,99,235,0.06)',   border: 'rgba(37,99,235,0.2)'   },
        nlp.competitiveEdge   && { icon: '🏆', label: 'Competitive Edge', text: nlp.competitiveEdge,   color: '#7C3AED', bg: 'rgba(124,58,237,0.06)',  border: 'rgba(124,58,237,0.2)'  },
    ].filter(Boolean);

    const chipsHTML = chips.length ? `
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">
            ${chips.map(c => `
                <div style="background:${c.bg};border:1px solid ${c.border};border-radius:10px;padding:12px 14px;">
                    <div style="font-size:11px;font-weight:700;color:${c.color};text-transform:uppercase;
                                letter-spacing:1px;margin-bottom:4px;">${c.icon} ${c.label}</div>
                    <div style="font-size:13px;color:#374151;line-height:1.55;">${c.text}</div>
                </div>`).join('')}
        </div>` : '';

    // Week-one action box
    const actionHTML = nlp.weekOneAction ? `
        <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(99,102,241,0.08));
                    border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px 16px;">
            <div style="font-size:11px;font-weight:700;color:#065F46;text-transform:uppercase;
                        letter-spacing:1px;margin-bottom:6px;">⚡ This Week's #1 Action</div>
            <div style="font-size:13px;color:#111827;font-weight:600;line-height:1.55;">${nlp.weekOneAction}</div>
        </div>` : '';

    panel.innerHTML = `
        <div style="background:linear-gradient(135deg,#ECFDF5,#F0FDF4);border:1px solid #6EE7B7;
                    border-radius:16px;padding:24px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;
                        background:linear-gradient(90deg,#10B981,#6366F1,#06B6D4);"></div>

            <!-- Header -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
                <div style="font-size:22px;">🤖</div>
                <div>
                    <div style="font-weight:800;font-size:16px;color:#064E3B;">AI Career Insights</div>
                    <div style="font-size:12px;color:#059669;">Powered by Groq · LLaMA 3.3 70B</div>
                </div>
                <div style="margin-left:auto;background:linear-gradient(135deg,#10B981,#059669);
                            color:white;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;">
                    Personalised
                </div>
            </div>

            <!-- Headline -->
            ${nlp.headline ? `
            <div style="font-size:17px;font-weight:800;color:#064E3B;margin-bottom:10px;
                        letter-spacing:-0.3px;line-height:1.35;">${nlp.headline}</div>` : ''}

            <!-- Narrative -->
            ${nlp.narrative ? `
            <div style="font-size:13px;color:#374151;line-height:1.65;margin-bottom:18px;
                        padding:12px 14px;background:white;border-radius:10px;border:1px solid #A7F3D0;">
                ${nlp.narrative}
            </div>` : ''}

            ${priorityHTML}
            ${chipsHTML}
            ${actionHTML}
        </div>`;
}
function renderBertInsights(bertData, track) {
    // Create or reuse the BERT panel
    let panel = document.getElementById('bertInsightsPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'bertInsightsPanel';
        panel.style.cssText = 'margin-top:24px;';
        // Insert after recsCard
        const recsCard = document.getElementById('recsCard');
        if (recsCard && recsCard.parentNode) {
            recsCard.parentNode.insertBefore(panel, recsCard.nextSibling);
        }
    }

    const semanticPairs  = bertData.semanticPairs  || [];
    const semanticMatches = bertData.semanticMatches || [];
    const missingSkills  = bertData.missingSkills   || [];

    if (!semanticPairs.length && !semanticMatches.length) return;

    let html = `
        <div style="background:linear-gradient(135deg,#EDE9FE,#F0F9FF);border:1px solid #C4B5FD;
                    border-radius:16px;padding:24px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="font-size:22px;">🧠</div>
                <div>
                    <div style="font-weight:800;font-size:16px;color:#4C1D95;">BERT Semantic Analysis</div>
                    <div style="font-size:12px;color:#7C3AED;">AI found additional skill matches beyond exact keywords</div>
                </div>
                <div style="margin-left:auto;background:#7C3AED;color:white;padding:4px 12px;
                            border-radius:20px;font-size:12px;font-weight:700;">
                    +${semanticMatches.length} semantic match${semanticMatches.length !== 1 ? 'es' : ''}
                </div>
            </div>`;

    // Semantic pairs — show what matched what
    if (semanticPairs.length) {
        html += `<div style="margin-bottom:16px;">
            <div style="font-size:12px;font-weight:700;color:#5B21B6;text-transform:uppercase;
                        letter-spacing:1px;margin-bottom:10px;">🔗 Semantic Skill Bridges</div>
            <div style="display:flex;flex-direction:column;gap:8px;">`;
        semanticPairs.forEach(p => {
            const barW  = p.score + '%';
            const isPartial = p.partial;
            const badge = isPartial
                ? `<span style="background:#FEF3C7;color:#D97706;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">PARTIAL</span>`
                : `<span style="background:#D1FAE5;color:#059669;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">MATCH</span>`;
            html += `
                <div style="background:white;border-radius:10px;padding:12px 14px;
                            border:1px solid ${isPartial ? '#FDE68A' : '#A7F3D0'};">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-weight:600;font-size:13px;color:#1F2937;">${p.required}</span>
                        <span style="color:#9CA3AF;">≈</span>
                        <span style="font-weight:600;font-size:13px;color:#7C3AED;">${p.matched}</span>
                        ${badge}
                        <span style="margin-left:auto;font-size:12px;font-weight:700;
                                     color:${isPartial ? '#D97706' : '#059669'};">${p.score}%</span>
                    </div>
                    <div style="background:#F3F4F6;border-radius:4px;height:4px;">
                        <div style="background:${isPartial ? '#F59E0B' : '#10B981'};height:4px;
                                    border-radius:4px;width:${barW};transition:width .6s ease;"></div>
                    </div>
                </div>`;
        });
        html += `</div></div>`;
    }

    // Still truly missing
    if (missingSkills.length) {
        html += `<div>
            <div style="font-size:12px;font-weight:700;color:#5B21B6;text-transform:uppercase;
                        letter-spacing:1px;margin-bottom:10px;">⚠️ Still Missing (even semantically)</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${missingSkills.map(s => `
                    <span style="background:#FEE2E2;color:#DC2626;border:1px solid #FCA5A5;
                                 padding:5px 12px;border-radius:20px;font-size:13px;font-weight:600;">
                        ${s}
                    </span>`).join('')}
            </div>
        </div>`;
    }

    html += `<div style="margin-top:14px;padding:10px 14px;background:rgba(124,58,237,0.06);
                         border-radius:8px;font-size:12px;color:#5B21B6;">
        💡 BERT understands that <em>"Cloud Experience"</em> covers <em>"AWS"</em> and 
        <em>"Frontend Dev"</em> covers <em>"React"</em> — so your score reflects real skill coverage, 
        not just exact keyword matches.
    </div>
    </div>`;

    panel.innerHTML = html;
}