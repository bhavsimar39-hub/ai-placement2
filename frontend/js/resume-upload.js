/* ── Response parser — handles both Groq (OpenAI format) and Anthropic format ── */
function parseAIResponse(data) {
    // Groq / OpenAI format: { choices: [{ message: { content: "..." } }] }
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    // Anthropic format: { content: [{ text: "..." }] }
    if (data.content?.[0]?.text) return data.content[0].text;
    // Error
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    throw new Error('Empty or unrecognised AI response — check GROQ_API_KEY in .env');
}
// Backwards compat alias
const parseClaudeResponse = parseAIResponse;

// =============================================
// Resume Upload Frontend
// =============================================

// API_BASE set globally by config.js

document.getElementById("uploadBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("resumeFile");
    if (!fileInput.files.length) {
        showToast("⚠️ Please select a resume file first", 'error');
        return;
    }

    const file      = fileInput.files[0];
    const uploadBtn = document.getElementById("uploadBtn");
    const resultBox = document.getElementById("result-box");
    const span      = uploadBtn.querySelector("span") || uploadBtn;

    // ── Loading states ──────────────────────────────────────────────────────
    uploadBtn.disabled = true;
    span.textContent   = "Analyzing...";

    // Show loading spinner in result-box immediately
    if (resultBox) {
        resultBox.className = "";
        resultBox.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                        padding:60px 20px;gap:20px;min-height:300px;">
                <div style="width:52px;height:52px;border:4px solid rgba(16,185,129,0.15);
                            border-top-color:#10B981;border-radius:50%;
                            animation:__spin 0.8s linear infinite;"></div>
                <div style="font-size:16px;font-weight:700;color:#10B981;">⚡ AI Analyzing Your Resume...</div>
                <div style="font-size:13px;color:#6B7280;text-align:center;max-width:280px;">
                    Groq is extracting skills, scoring ATS compatibility, and generating insights
                </div>
            </div>
            <style>@keyframes __spin{to{transform:rotate(360deg)}}</style>`;
    }

    try {
        const formData = new FormData();
        formData.append("resume", file);
        const token = localStorage.getItem("token");

        const uploadResponse = await fetch(`${API_BASE}/resume/upload?t=${Date.now()}`, {
            method:  "POST",
            headers: { "Authorization": `Bearer ${token}`, "Cache-Control": "no-cache" },
            body:    formData
        });

        if (!uploadResponse.ok) {
            const err = await uploadResponse.json().catch(() => ({ message: `HTTP ${uploadResponse.status}` }));
            throw new Error(err.message || `Server error ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
            throw new Error(uploadResult.message || "Analysis failed");
        }

        // Render results into result-box and NLP section
        displayAnalysis(uploadResult);
        runNLPFromBackend(uploadResult.analysis);

        // Persist bridge for other pages
        try {
            const a = uploadResult.analysis;
            localStorage.setItem("resume_status",   "Uploaded ✔");
            localStorage.setItem("ats_score",        a.atsScore?.total || 0);
            localStorage.setItem("readiness_score",  a.readinessScore  || 0);
            localStorage.setItem("skills_found",     JSON.stringify(a.skills || []));
            localStorage.setItem("resume_nlp_bridge", JSON.stringify({
                analysis: a, filename: file.name, timestamp: Date.now()
            }));
        } catch (_) {}

        showToast(`✅ Done! ${uploadResult.analysis.skills?.length || 0} skills · ATS ${uploadResult.analysis.atsScore?.total || 0}/100`, "success");

        if (typeof loadDashboardData === "function") setTimeout(() => loadDashboardData(), 1000);

    } catch (error) {
        console.error("❌ Resume upload error:", error);
        // Show error inside result-box so it's always visible
        if (resultBox) {
            resultBox.className = "";
            resultBox.innerHTML = `
                <div style="padding:40px 28px;">
                    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25);
                                border-left:4px solid #EF4444;border-radius:12px;padding:20px 24px;">
                        <div style="font-weight:700;color:#DC2626;font-size:15px;margin-bottom:8px;">
                            ❌ Analysis Failed
                        </div>
                        <div style="color:#DC2626;font-size:13px;line-height:1.6;">${error.message}</div>
                        <div style="margin-top:12px;font-size:12px;color:#9CA3AF;">
                            Check that your backend is running on port 5000 and GROQ_API_KEY is set in .env
                        </div>
                    </div>
                </div>`;
        }
        showToast("❌ " + error.message, "error");
    } finally {
        uploadBtn.disabled = false;
        // Restore original button HTML structure
        span.textContent = "Analyze Resume";
    }
});

function displayAnalysis(result) {
    const analysis  = result.analysis;
    const resultBox = document.getElementById("result-box");
    if (!resultBox) { console.error("result-box not found in DOM"); return; }

    // Save to localStorage for dashboard
    localStorage.setItem("resume_status",   "Uploaded ✔");
    localStorage.setItem("ats_score",       analysis.atsScore?.total || 0);
    localStorage.setItem("readiness_score", analysis.readinessScore  || 0);
    localStorage.setItem("skills_found",    JSON.stringify(analysis.skills || []));

    const ats          = analysis.atsScore?.total || 0;
    const readiness    = analysis.readinessScore  || 0;
    const grade        = analysis.atsScore?.grade || (ats >= 85 ? "Excellent" : ats >= 70 ? "Good" : ats >= 50 ? "Fair" : "Needs Work");
    const skills       = analysis.skills          || [];
    const strengths    = analysis.strengths       || [];
    const weaknesses   = analysis.weaknesses      || [];
    const flags        = analysis.flags           || [];
    const ci           = analysis.contactInfo     || {};
    const exp          = analysis.experience      || {};
    const edu          = analysis.education       || {};

    // Build missing skills = skills Groq flagged as missing from flags
    const missingSkills = flags
        .filter(f => f.type === "warning" || f.type === "error")
        .map(f => f.text)
        .slice(0, 8);

    resultBox.className = "";
    resultBox.innerHTML = `
            <h3><i class='bx bx-check-circle'></i> Analysis Complete
                ${result.analysis.groqPowered ? '<span style="font-size:12px;opacity:0.85;font-weight:500;margin-left:8px;">⚡ Groq AI</span>' : ''}
            </h3>
            <p>Analyzed by AI — results are specific to your resume</p>
        </div>

        <div class="result-content">

            <!-- Stats row -->
            <div class="stats-mini">
                <div class="stat-mini">
                    <div class="stat-mini-value" style="color:#10B981;">${ats}</div>
                    <div class="stat-mini-label">ATS Score / 100</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-value" style="color:#6366F1;">${skills.length}</div>
                    <div class="stat-mini-label">Skills Found</div>
                </div>
                <div class="stat-mini" style="grid-column:span 2;">
                    <div class="stat-mini-value" style="font-size:20px;color:#F59E0B;">${grade}</div>
                    <div class="stat-mini-label">ATS Grade</div>
                </div>
            </div>

            <!-- Contact extracted -->
            ${(ci.name || ci.email || ci.phone) ? `
            <div class="result-section">
                <h4><i class='bx bx-user' style="color:#10b981;"></i> Contact Info Extracted</h4>
                <div class="list-items">
                    ${ci.name    ? `<div class="list-item"><div class="list-item-icon">👤</div><div class="list-item-text"><strong>${ci.name}</strong></div></div>` : ''}
                    ${ci.email   ? `<div class="list-item"><div class="list-item-icon">📧</div><div class="list-item-text">${ci.email}</div></div>` : ''}
                    ${ci.phone   ? `<div class="list-item"><div class="list-item-icon">📱</div><div class="list-item-text">${ci.phone}</div></div>` : ''}
                    ${ci.linkedin? `<div class="list-item"><div class="list-item-icon">💼</div><div class="list-item-text">${ci.linkedin}</div></div>` : ''}
                    ${ci.github  ? `<div class="list-item"><div class="list-item-icon">💻</div><div class="list-item-text">${ci.github}</div></div>` : ''}
                </div>
            </div>
            <div class="divider"></div>` : ''}

            <!-- Experience + Education -->
            <div class="stats-mini" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
                <div class="stat-mini">
                    <div class="stat-mini-value" style="font-size:16px;color:#6366F1;">${exp.estimatedYears > 0 ? exp.estimatedYears + ' yrs' : 'Fresher'}</div>
                    <div class="stat-mini-label">${exp.level || 'Experience'}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-value" style="font-size:14px;color:#10B981;">${edu.highestDegree || 'Not detected'}</div>
                    <div class="stat-mini-label">Highest Degree</div>
                </div>
            </div>

            <!-- Skills Detected -->
            <div class="result-section">
                <h4><i class='bx bx-check-circle' style="color:#10b981;"></i> Skills Detected (${skills.length})</h4>
                <div class="skills-grid">
                    ${skills.length > 0
                        ? skills.map(s => `<span class="skill-tag found">${s}</span>`).join('')
                        : '<span style="color:#9ca3af;">No skills detected</span>'}
                </div>
            </div>

            <div class="divider"></div>

            <!-- Strengths from Groq -->
            ${strengths.length > 0 ? `
            <div class="result-section">
                <h4><i class='bx bx-star' style="color:#f59e0b;"></i> Strengths</h4>
                <div class="list-items">
                    ${strengths.map(s => `
                        <div class="list-item">
                            <div class="list-item-icon">✅</div>
                            <div class="list-item-text">${s}</div>
                        </div>`).join('')}
                </div>
            </div>
            <div class="divider"></div>` : ''}

            <!-- Improvements from Groq -->
            ${weaknesses.length > 0 ? `
            <div class="result-section">
                <h4><i class='bx bx-bulb' style="color:#0ea5e9;"></i> Suggested Improvements</h4>
                <div class="list-items">
                    ${weaknesses.map(w => `
                        <div class="list-item">
                            <div class="list-item-icon">💡</div>
                            <div class="list-item-text">${w}</div>
                        </div>`).join('')}
                </div>
            </div>
            <div class="divider"></div>` : ''}

            <!-- Readiness Score -->
            <div class="result-section">
                <h4><i class='bx bx-trending-up' style="color:#10b981;"></i> Overall Readiness Score</h4>
                <div class="score-container">
                    <div class="score-label">Your Score</div>
                    <div class="score-display">${readiness}</div>
                    <div class="score-interpretation">${readiness >= 80 ? 'Excellent' : readiness >= 65 ? 'Good' : readiness >= 45 ? 'Fair' : 'Needs Work'}</div>
                </div>
            </div>

        </div>`;

    // Scroll result-box into view
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const style = document.createElement('style');
style.textContent = `
    .skill-badge{display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;
        padding:5px 12px;margin:4px;border-radius:20px;font-size:12px;font-weight:500;}
    .strength-item{color:#10b981;margin:8px 0;}
    .weakness-item{color:#f59e0b;margin:8px 0;}
    .no-data{color:#9ca3af;font-style:italic;}
    .score-circle{display:inline-flex;align-items:center;justify-content:center;
        width:120px;height:120px;border-radius:50%;
        background:linear-gradient(135deg,#667eea,#764ba2);margin:20px auto;}
    .score-value{font-size:36px;font-weight:bold;color:#fff;}
    .score-label{font-size:18px;color:rgba(255,255,255,0.8);}
    .score-grade{text-align:center;font-size:18px;font-weight:600;margin-top:10px;}
    .score-display{font-size:56px;font-weight:900;background:linear-gradient(135deg,#10B981,#06B6D4);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;line-height:1;margin:12px 0;font-family:monospace;}
    .score-interpretation{font-size:15px;color:#10B981;font-weight:700;}
    .stats-mini{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:12px;margin-bottom:20px;}
    .stat-mini{text-align:center;padding:16px 12px;background:#F3F4F6;border-radius:12px;border:1px solid #E5E7EB;}
    .stat-mini-value{font-size:28px;font-weight:800;color:var(--teal,#10B981);margin-bottom:4px;font-family:monospace;}
    .stat-mini-label{font-size:10px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;}`;
document.head.appendChild(style);
document.head.appendChild(style);

// File preview on selection
document.getElementById("resumeFile")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("filePreview");
    if (file && preview) {
        preview.innerHTML = `<div style="padding:10px;background:#f3f4f6;border-radius:8px;margin:10px 0;">
            <p style="margin:0;"><strong>Selected:</strong> ${file.name}</p>
            <p style="margin:5px 0 0;font-size:12px;color:#6b7280;">
                Size: ${(file.size/1024).toFixed(2)} KB</p></div>`;
    }
});

// =====================================================================
// NLP ANALYSIS ENGINE
// Uses backend analysis data — accurate because backend parsed the PDF
// =====================================================================

let nlpExtractedProfile = {};

/**
 * Primary path: map backend analysis fields into NLP cards.
 * No FileReader, no binary PDF garbage, no duplicate Groq call.
 */
function runNLPFromBackend(analysis) {
    const nlpSection = document.getElementById('nlpSection');
    const nlpLoading = document.getElementById('nlpLoading');
    const nlpResults = document.getElementById('nlpResults');
    if (!nlpSection) return;

    nlpSection.classList.add('active');
    if (nlpLoading) nlpLoading.style.display = 'block';
    if (nlpResults) nlpResults.style.display = 'none';
    nlpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // ── Build profile from backend fields ──────────────────────
    const ci  = analysis.contactInfo || {};
    const exp = analysis.experience  || {};
    const edu = analysis.education   || {};

    const profile = {
        name:             ci.name     || analysis.profile?.name     || 'Not detected',
        email:            ci.email    || analysis.profile?.email    || 'Not found',
        phone:            ci.phone    || analysis.profile?.phone    || 'Not found',
        location:         ci.location || analysis.profile?.location || 'Not found',
        experience_years: typeof exp === 'object'
                            ? (exp.estimatedYears ? `${exp.estimatedYears} years` : analysis.profile?.experience_years || 'Not detected')
                            : analysis.profile?.experience_years || 'Not detected',
        education:        typeof edu === 'object'
                            ? (edu.highestDegree || analysis.profile?.education || 'Not detected')
                            : analysis.profile?.education || 'Not detected',
        top_skills:       (analysis.skills || []).slice(0, 8),
        current_role:     exp.detectedTitles?.[0] || analysis.profile?.current_role || 'Not detected',
        career_level:     analysis.experienceLevel || exp.level || analysis.profile?.career_level || 'Entry Level',
    };

    // ── Build tone from ATS score ──────────────────────────────
    const atsTotal = analysis.atsScore?.total ?? (typeof analysis.atsScore === 'number' ? analysis.atsScore : 0);
    const tone = analysis.tone || {
        score:       atsTotal,
        label:       analysis.atsScore?.grade || (atsTotal >= 75 ? 'Professional' : atsTotal >= 50 ? 'Moderate' : 'Needs Work'),
        emoji:       atsTotal >= 75 ? '💼' : atsTotal >= 50 ? '📝' : '⚠️',
        description: `Your resume scores ${atsTotal}/100 on ATS readiness. ${analysis.atsScore?.grade ? 'Grade: ' + analysis.atsScore.grade + '.' : ''}`,
        issues:      (analysis.weaknesses || []).slice(0, 3),
    };

    // ── Build verbs from backend weak verbs ────────────────────
    const verbs = (analysis.verbs || analysis.weakVerbs || []).map(v => ({
        weak:    v.weak,
        strong:  v.strong,
        context: v.context || 'resume bullet'
    }));

    // ── Build flags from backend flags / strengths / weaknesses ─
    let flags = analysis.flags || [];
    if (flags.length === 0) {
        flags = [
            ...(analysis.strengths  || []).map(s => ({ type: 'success', icon: '✅', text: s })),
            ...(analysis.weaknesses || []).map(w => ({ type: 'warning',  icon: '⚠️', text: w })),
        ];
    }

    renderNLPProfile(profile);
    renderNLPTone(tone);
    renderNLPVerbs(verbs);
    renderNLPFlags(flags);

    nlpExtractedProfile = profile;
    if (nlpLoading) nlpLoading.style.display = 'none';
    if (nlpResults) nlpResults.style.display = 'block';

    localStorage.setItem('nlp_profile', JSON.stringify(profile));
    localStorage.setItem('nlp_tone',    JSON.stringify(tone));
    localStorage.setItem('nlp_done',    'true');

    // Always enhance with Groq for richer NLP cards — backend already has
    // the text parsed so this is a fast, targeted call using structured data
    enhanceWithGroq(analysis);
}

/**
 * Groq enhancement — runs when backend data is sparse.
 * Sends what the backend already parsed, no re-reading of file.
 */
async function enhanceWithGroq(analysis) {
    // Build a text summary from backend structured data to send to Groq
    const summaryParts = [
        `Skills: ${(analysis.skills || []).join(', ')}`,
        `Experience: ${analysis.experienceLevel || ''}`,
        `Education: ${analysis.education?.highestDegree || ''}`,
        `Strengths: ${(analysis.strengths || []).join(', ')}`,
        `Weaknesses: ${(analysis.weaknesses || []).join(', ')}`,
    ].filter(Boolean).join('\n');

    if (summaryParts.length < 50) return;

    try {
        const prompt = `Based on this resume analysis data, generate detailed NLP insights. Return ONLY valid JSON, no markdown.

Data:
${summaryParts}

Return:
{
  "profile": {
    "name": "Unknown",
    "email": "Not found",
    "phone": "Not found",
    "location": "Not found",
    "experience_years": "estimated from data",
    "education": "from data",
    "top_skills": ["skill1","skill2","skill3","skill4","skill5"],
    "current_role": "estimated role",
    "career_level": "Junior / Mid-level / Senior"
  },
  "tone": {
    "score": 70,
    "label": "Professional",
    "emoji": "💼",
    "description": "One specific sentence about this resume's tone",
    "issues": ["Specific issue 1", "Specific issue 2"]
  },
  "verbs": [
    {"weak": "helped",          "strong": "Facilitated",   "context": "team coordination"},
    {"weak": "worked on",       "strong": "Engineered",    "context": "software projects"},
    {"weak": "responsible for", "strong": "Owned",         "context": "management"},
    {"weak": "did",             "strong": "Executed",      "context": "delivery"},
    {"weak": "made",            "strong": "Developed",     "context": "product work"}
  ],
  "flags": [
    {"type": "success", "icon": "✅", "text": "Specific strength found in the data"},
    {"type": "warning", "icon": "⚠️", "text": "Specific improvement opportunity"},
    {"type": "success", "icon": "✅", "text": "Another specific strength"},
    {"type": "warning", "icon": "⚠️", "text": "Another specific suggestion"},
    {"type": "error",   "icon": "🚨", "text": "Critical gap if any, else another warning"}
  ]
}`;

        const response = await fetch(`${API_BASE}/nlp/claude`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
        });

        const data   = await response.json();
        const text   = parseClaudeResponse(data);
        const match  = text.match(/\{[\s\S]*\}/);
        if (!match) return;

        const result = JSON.parse(match[0]);

        if (result.profile) {
            // Overlay backend contact data (more accurate) over Groq profile
            const ci = analysis.contactInfo || {};
            result.profile.email = ci.email || result.profile.email;
            result.profile.phone = ci.phone || result.profile.phone;
            result.profile.name  = ci.name  || result.profile.name;
            renderNLPProfile(result.profile);
            nlpExtractedProfile = result.profile;
            localStorage.setItem('nlp_profile', JSON.stringify(result.profile));
        }
        if (result.tone)  renderNLPTone(result.tone);
        if (result.verbs) renderNLPVerbs(result.verbs);
        if (result.flags) renderNLPFlags(result.flags);

    } catch (err) {
        console.warn('Groq NLP enhancement skipped:', err.message);
    }
}

// ── Render functions ─────────────────────────────────────────

function renderNLPProfile(p) {
    const el = document.getElementById('nlpProfile');
    if (!el) return;
    const rows = [
        { label: 'Name',          value: p.name },
        { label: 'Email',         value: p.email },
        { label: 'Phone',         value: p.phone },
        { label: 'Location',      value: p.location },
        { label: 'Experience',    value: p.experience_years },
        { label: 'Education',     value: p.education },
        { label: 'Current Role',  value: p.current_role },
        { label: 'Career Level',  value: p.career_level },
    ];
    el.innerHTML = rows.map(r => `
        <div class="profile-item">
            <div class="profile-item-label">${r.label}</div>
            <div class="profile-item-value">${r.value || 'Not detected'}</div>
        </div>`).join('') + `
        <div class="profile-item" style="grid-column:1/-1;">
            <div class="profile-item-label">Top Skills</div>
            <div class="profile-item-value">
                ${(p.top_skills || []).map(s =>
                    `<span class="skill-tag found" style="margin:3px;">${s}</span>`).join('')}
            </div>
        </div>`;
}

function renderNLPTone(tone) {
    const el = document.getElementById('nlpTone');
    if (!el) return;
    el.innerHTML = `
        <div class="tone-meter">
            <div class="tone-emoji">${tone.emoji || '📝'}</div>
            <div style="flex:1;">
                <div class="tone-label">${tone.label}</div>
                <div class="tone-desc">${tone.description}</div>
            </div>
            <div class="tone-score">${tone.score}/100</div>
        </div>
        ${(tone.issues || []).map(i => `
            <div class="flag-item warning">
                <div class="flag-icon">⚠️</div>
                <div class="flag-text">${i}</div>
            </div>`).join('')}`;
}

function renderNLPVerbs(verbs) {
    const el = document.getElementById('nlpVerbs');
    if (!el) return;
    if (!verbs || verbs.length === 0) {
        el.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No weak verbs detected — great job! ✅</div>';
        return;
    }
    el.innerHTML = `<div style="margin-bottom:12px;font-size:13px;color:var(--text-muted);">
            Replace these weak words with stronger action verbs:</div>` +
        verbs.map(v => `
            <div class="verb-row">
                <span class="verb-weak">❌ ${v.weak}</span>
                <span class="verb-arrow">→</span>
                <span class="verb-strong">✅ ${v.strong}</span>
                <span style="font-size:11px;color:var(--text-muted);margin-left:auto;">${v.context || ''}</span>
            </div>`).join('');
}

function renderNLPFlags(flags) {
    const el = document.getElementById('nlpFlags');
    if (!el) return;
    if (!flags || flags.length === 0) {
        el.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No issues detected ✅</div>';
        return;
    }
    el.innerHTML = flags.map(f => `
        <div class="flag-item ${f.type}">
            <div class="flag-icon">${f.icon}</div>
            <div class="flag-text">${f.text}</div>
        </div>`).join('');
}

function saveProfileToStorage() {
    if (!nlpExtractedProfile?.name || nlpExtractedProfile.name === 'Not detected') {
        showToast('⚠️ Upload and analyze a resume first!', 'error'); return;
    }
    localStorage.setItem('nlp_profile', JSON.stringify(nlpExtractedProfile));
    const btn = document.querySelector('.save-profile-btn');
    if (btn) {
        btn.textContent = '✅ Saved!';
        btn.style.background = 'linear-gradient(135deg,#059669,#047857)';
        setTimeout(() => { btn.innerHTML = '💾 Save Profile for Other Features'; btn.style.background = ''; }, 3000);
    }
}

console.log('🧠 Resume Upload + NLP Engine loaded!');

// ── Toast notification (replaces all alert() calls) ──────────────────────────
function showToast(message, type = 'info') {
    const colors = {
        success: { bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.3)', text:'#059669' },
        error:   { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.3)',  text:'#DC2626' },
        info:    { bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.3)', text:'#4F46E5' },
    };
    const c = colors[type] || colors.info;

    // Remove any existing toast
    document.getElementById('__resume-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = '__resume-toast';
    toast.style.cssText = `
        position:fixed; top:80px; right:24px; z-index:99999;
        background:${c.bg}; border:1px solid ${c.border};
        border-radius:14px; padding:14px 20px;
        font-family:'Plus Jakarta Sans','Inter',sans-serif;
        font-size:14px; font-weight:600; color:${c.text};
        box-shadow:0 8px 32px rgba(0,0,0,0.15);
        max-width:380px; line-height:1.5;
        backdrop-filter:blur(12px);
        animation:__toastIn .3s cubic-bezier(.4,0,.2,1);`;
    toast.textContent = message;

    if (!document.getElementById('__toast-style')) {
        const s = document.createElement('style');
        s.id = '__toast-style';
        s.textContent = `@keyframes __toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`;
        document.head.appendChild(s);
    }

    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 4000);
}