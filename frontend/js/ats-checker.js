// =============================================================
// ATS Checker Frontend — /js/ats-checker.js
// Handles: file upload → API → results display → NLP cards
// =============================================================

const API_BASE = 'http://localhost:5000/api';
const CIRCUMFERENCE = 2 * Math.PI * 90; // matches r="90" in SVG

let currentResumeText = '';   // kept for JD matcher

// ─────────────────────────────────────────────────────────────
// DOM READY
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login.html'; return; }

    setupFileInput();
    setupDragDrop();
    setupAnalyzeBtn();

    // Initialise SVG circle
    const circle = document.getElementById('scoreCircle');
    if (circle) {
        circle.style.strokeDasharray  = CIRCUMFERENCE;
        circle.style.strokeDashoffset = CIRCUMFERENCE;
    }
});

// ─────────────────────────────────────────────────────────────
// FILE INPUT
// ─────────────────────────────────────────────────────────────
function setupFileInput() {
    const input = document.getElementById('resumeFile');
    if (!input) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelected(file);
    });
}

function handleFileSelected(file) {
    const area = document.getElementById('uploadArea');
    const btn  = document.getElementById('analyzeBtn');

    // Update upload zone to show selected file
    const icon    = document.getElementById('uploadIcon');
    const text    = document.getElementById('uploadText');
    const subtext = document.getElementById('uploadSubtext');

    if (icon)    icon.textContent    = '✅';
    if (text)    text.textContent    = file.name;
    if (subtext) subtext.innerHTML   = '<span style="color:#10b981;">' + (file.size / 1024).toFixed(1) + ' KB</span> &nbsp;•&nbsp; <span style="color:#6B7280;text-decoration:underline;cursor:pointer;">Change file</span>';

    if (area) {
        area.style.borderColor = '#10b981';
        area.style.background  = 'rgba(16,185,129,0.06)';
    }

    if (btn) btn.style.display = 'block';
}

// ─────────────────────────────────────────────────────────────
// DRAG & DROP
// ─────────────────────────────────────────────────────────────
function setupDragDrop() {
    const area = document.getElementById('uploadArea');
    if (!area) return;

    // Prevent default drag behaviours
    ['dragenter','dragover','dragleave','drop'].forEach(evt => {
        area.addEventListener(evt, e => e.preventDefault());
        document.body.addEventListener(evt, e => e.preventDefault());
    });

    area.addEventListener('dragover', () => area.classList.add('dragover'));
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Inject into hidden file input so FormData picks it up
        const input = document.getElementById('resumeFile');
        try {
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
        } catch (_) {} // Safari fallback — will still work via window.__droppedFile

        window.__droppedFile = file; // fallback for Safari
        handleFileSelected(file);
    });
}

// ─────────────────────────────────────────────────────────────
// ANALYZE BUTTON
// ─────────────────────────────────────────────────────────────
function setupAnalyzeBtn() {
    const btn = document.getElementById('analyzeBtn');
    if (!btn) return;
    btn.addEventListener('click', runAnalysis);
}

async function runAnalysis() {
    const input = document.getElementById('resumeFile');
    const file  = input?.files[0] || window.__droppedFile;
    if (!file) { alert('Please select or drop a resume file first.'); return; }

    const btn = document.getElementById('analyzeBtn');
    btn.disabled    = true;
    btn.textContent = 'Analyzing…';

    // Show results panel with loading state
    resetResults();
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) resultsDiv.style.display = 'block';

    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('resume', file);

        // If image was pre-processed by vision engine, send extracted text
        if (window.__isImageResume && window.__resumeText) {
            formData.append('extractedText', window.__resumeText);
        }

        const res = await fetch(`${API_BASE}/ats/analyze`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.status === 401) { window.location.href = '/login.html'; return; }
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
            throw new Error(err.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Analysis failed');

        // ── Store SERVER-extracted text for JD matcher (clean, proper text) ──
        // This is far more accurate than re-reading the file client-side,
        // especially for PDFs which return binary garbage via FileReader.
        if (data.resumeText) {
            currentResumeText = data.resumeText;
            localStorage.setItem('ats_resume_text', data.resumeText);
        } else {
            // Fallback: read file as text (only useful for .txt files)
            readFileText(file).then(t => {
                if (t && t.length > 100) currentResumeText = t;
            });
        }

        // Render everything
        renderResults(data.analysis);

        // Save to localStorage for dashboard
        localStorage.setItem('ats_score',  data.analysis.score);
        localStorage.setItem('resume_status', 'Uploaded ✔');

        // Run NLP cards after a short delay
        setTimeout(() => runNLPCards(data.analysis), 800);

    } catch (err) {
        showAnalysisError(err.message);
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Analyze Resume';
    }
}

// ─────────────────────────────────────────────────────────────
// RENDER RESULTS
// ─────────────────────────────────────────────────────────────
function resetResults() {
    setText('scoreValue', '…');
    setText('scoreStatus', 'Analyzing…');
    setBar('formatBar',    0); setText('formatScore',    0);
    setBar('keywordBar',   0); setText('keywordScore',   0);
    setBar('structureBar', 0); setText('structureScore', 0);
    setBar('contentBar',   0); setText('contentScore',   0);
    setHTML('issuesList',         '<div class="loading-inline">⏳ Scanning…</div>');
    setHTML('optimizedKeywords',  '');
    setHTML('missingKeywords',    '');
    setHTML('recommendationsList','');
    setCircle(0);
}

function renderResults(analysis) {
    const score = analysis.score || 0;

    // ── Score circle ──────────────────────────────────────────
    setCircle(score);
    setText('scoreValue',  score);
    setText('scoreStatus', scoreLabel(score));

    // ── Sub-scores ────────────────────────────────────────────
    const a = analysis.analysis || {};
    const fs = Math.min(100, Math.round(a.formatScore    || 0));
    const ks = Math.min(100, Math.round(a.keywordScore   || 0));
    const ss = Math.min(100, Math.round(a.structureScore || 0));
    const cs = Math.min(100, Math.round(a.contentScore   || 0));

    animateBar('formatBar',    'formatScore',    fs);
    animateBar('keywordBar',   'keywordScore',   ks);
    animateBar('structureBar', 'structureScore', ss);
    animateBar('contentBar',   'contentScore',   cs);

    // ── Issues ────────────────────────────────────────────────
    const issues = analysis.issues || [];
    if (issues.length === 0) {
        setHTML('issuesList', '<div class="issue-item success"><strong>✅ No major issues found!</strong></div>');
    } else {
        setHTML('issuesList', issues.map(issue => `
            <div class="issue-item ${issue.type || 'warning'}">
                <div class="issue-header">
                    <span class="issue-badge ${issue.type}">${issue.type === 'error' ? '🔴 Error' : '🟡 Warning'}</span>
                    <span class="issue-category">${esc(issue.category || '')}</span>
                </div>
                <div class="issue-message">${esc(issue.message || '')}</div>
                ${issue.fix ? `<div class="issue-fix">💡 Fix: ${esc(issue.fix)}</div>` : ''}
            </div>
        `).join(''));
    }

    // ── Keywords ──────────────────────────────────────────────
    const found   = analysis.optimizedKeywords || [];
    const missing = analysis.missingKeywords   || [];

    setHTML('optimizedKeywords', found.length
        ? found.map(k => `<span class="keyword-tag found">${esc(k)}</span>`).join('')
        : '<span style="color:#6B7280">None detected</span>'
    );

    setHTML('missingKeywords', missing.length
        ? missing.map(k => `<span class="keyword-tag missing">${esc(k)}</span>`).join('')
        : '<span style="color:#6B7280">All key terms covered ✅</span>'
    );

    // ── Recommendations ───────────────────────────────────────
    const recs = analysis.recommendations || [];
    if (recs.length === 0) {
        setHTML('recommendationsList', '<p style="color:#059669;font-weight:600;">✅ Resume looks great! Keep it up.</p>');
    } else {
        setHTML('recommendationsList', recs.map((r, i) => `
            <div class="recommendation-item">
                <div class="rec-number">${i + 1}</div>
                <div class="rec-text">${esc(r)}</div>
            </div>
        `).join(''));
    }
}

// ─────────────────────────────────────────────────────────────
// SVG CIRCLE
// ─────────────────────────────────────────────────────────────
function setCircle(score) {
    const circle = document.getElementById('scoreCircle');
    if (!circle) return;

    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    circle.style.strokeDasharray  = CIRCUMFERENCE;
    circle.style.strokeDashoffset = offset;
    circle.style.transition       = 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)';

    const colour = score >= 80 ? '#059669'
                 : score >= 60 ? '#3B82F6'
                 : score >= 40 ? '#F59E0B'
                 :               '#EF4444';
    circle.style.stroke = colour;
}

// ─────────────────────────────────────────────────────────────
// NLP CARDS (Synonym Matcher · Bullet Rewriter)
// ─────────────────────────────────────────────────────────────
function runNLPCards(analysis) {
    const section = document.getElementById('nlpAtsSection');
    if (section) section.classList.add('active');

    renderSynonymCard(analysis);
    renderBulletCard(analysis);
}

function renderSynonymCard(analysis) {
    const el = document.getElementById('nlpSynonymBody');
    if (!el) return;

    const found   = analysis.optimizedKeywords || [];
    const missing = analysis.missingKeywords   || [];

    // Build synonym groups for found keywords
    const SYNONYMS = {
        'developed':   ['built','engineered','created','implemented','coded'],
        'managed':     ['led','supervised','oversaw','directed','coordinated'],
        'improved':    ['optimized','enhanced','upgraded','boosted','refined'],
        'designed':    ['architected','crafted','built','created','devised'],
        'analyzed':    ['evaluated','assessed','reviewed','investigated','researched'],
        'communicated':['presented','collaborated','coordinated','liaised','reported'],
        'increased':   ['grew','scaled','expanded','boosted','accelerated'],
        'reduced':     ['cut','decreased','minimized','streamlined','eliminated'],
    };

    const rows = found.slice(0, 12).map(kw => {
        const syns = SYNONYMS[kw.toLowerCase()] || [];
        return `<div class="synonym-row">
            <span class="syn-keyword">${esc(kw)}</span>
            ${syns.length ? `<span class="syn-sep">≈</span>
            <span class="syn-list">${syns.map(s => `<span class="syn-tag">${s}</span>`).join('')}</span>` : ''}
        </div>`;
    });

    el.innerHTML = rows.length
        ? `<div class="synonym-grid">${rows.join('')}</div>
           <p style="color:#6B7280;font-size:12px;margin-top:12px;">
             Using synonyms helps beat ATS filters that look for exact keyword matches.
           </p>`
        : '<p style="color:#6B7280;padding:12px;">No keywords found to analyse synonyms for.</p>';
}

function renderBulletCard(analysis) {
    const el = document.getElementById('nlpBulletBody');
    if (!el) return;

    const WEAK_STRONG = [
        { weak: 'helped with',      strong: 'Contributed to',   impact: 'Shows ownership' },
        { weak: 'responsible for',  strong: 'Owned / Led',       impact: 'Shows accountability' },
        { weak: 'worked on',        strong: 'Engineered',        impact: 'Shows technical depth' },
        { weak: 'did',              strong: 'Executed',          impact: 'Action-oriented' },
        { weak: 'made',             strong: 'Developed',         impact: 'More professional' },
        { weak: 'assisted',         strong: 'Collaborated on',   impact: 'Shows teamwork' },
        { weak: 'tried to',         strong: 'Successfully',      impact: 'Removes uncertainty' },
        { weak: 'was involved in',  strong: 'Drove',             impact: 'Shows initiative' },
    ];

    const score = analysis.score || 0;
    const grade = score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'weak';

    el.innerHTML = `
        <div class="bullet-grade bullet-grade-${grade}">
            Bullet Point Strength: <strong>${grade.toUpperCase()}</strong>
            (${score >= 80 ? 'Great action verbs detected!' : 'Consider replacing weak verbs below'})
        </div>
        <table class="verb-table">
            <thead><tr>
                <th>❌ Weak Verb</th>
                <th>✅ Stronger Alternative</th>
                <th>Why It Works</th>
            </tr></thead>
            <tbody>
                ${WEAK_STRONG.map(row => `<tr>
                    <td class="verb-weak">${row.weak}</td>
                    <td class="verb-strong">${row.strong}</td>
                    <td class="verb-impact">${row.impact}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    `;
}

// ─────────────────────────────────────────────────────────────
// JD MATCHER
// ─────────────────────────────────────────────────────────────
window.runJDMatcher = async function() {
    const jdText = (document.getElementById('jdTextarea')?.value || '').trim();
    if (!jdText) { alert('Please paste a job description first.'); return; }

    const btn     = document.getElementById('jdAnalyzeBtn');
    const results = document.getElementById('jdResults');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Analysing with BERT…'; }
    if (results) results.style.display = 'none';

    try {
        // ── Use server-extracted text (most accurate source) ──────────────
        // Priority: 1) in-memory from this session  2) localStorage  3) empty
        const resumeTxt = currentResumeText
            || localStorage.getItem('ats_resume_text')
            || localStorage.getItem('resume_nlp_bridge') && (() => {
                try { return JSON.parse(localStorage.getItem('resume_nlp_bridge'))?.analysis?.summary || ''; } catch { return ''; }
            })()
            || '';

        const token = localStorage.getItem('token') || '';

        if (!resumeTxt || resumeTxt.length < 50) {
            if (results) {
                results.style.display = 'block';
                results.innerHTML = '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;color:#92400E;font-size:14px;">'
                    + '⚠️ <strong>No resume text found.</strong> Please analyze your resume first (click "Analyze Resume" above), then use the JD matcher.</div>';
            }
            return;
        }

        // ── BERT semantic matching via backend ────────────────────────────
        let bertResult = null;
        if (token) {
            try {
                const bertRes = await fetch('http://localhost:5000/api/skills/bert-jd-match', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body:    JSON.stringify({ resumeText: resumeTxt, jdText }),
                });
                if (bertRes.ok) {
                    const raw = await bertRes.json();
                    if (raw.success || raw.overallScore !== undefined) bertResult = raw;
                }
            } catch (_) { /* BERT unavailable — use keyword fallback */ }
        }

        // ── Improved keyword fallback ──────────────────────────────────────
        // Extract meaningful tech keywords (3+ chars, not stop words)
        const STOP = new Set(['the','and','for','with','from','that','this','will','have',
            'more','your','our','their','you','can','are','was','were','been','has','had',
            'not','but','use','used','using','must','may','able','into','also','each']);

        function extractTechKeywords(text) {
            return [...new Set(
                text.toLowerCase()
                    .replace(/[^a-z0-9\s\+#\.]/g, ' ')
                    .split(/\s+/)
                    .filter(w => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w))
            )];
        }

        const jdWords     = extractTechKeywords(jdText);
        const resumeWords = extractTechKeywords(resumeTxt);
        const kwMatched   = jdWords.filter(w => resumeWords.includes(w));
        const kwMissing   = jdWords.filter(w => !resumeWords.includes(w))
            .filter(w => w.length > 3); // filter out short noise words
        const kwPct = jdWords.length > 0 ? Math.round((kwMatched.length / jdWords.length) * 100) : 0;

        // Use BERT score if available, else keyword score
        const matchPct = (bertResult && (bertResult.overallScore || bertResult.success))
            ? (bertResult.overallScore || 0) : kwPct;
        const colour = matchPct >= 70 ? '#059669' : matchPct >= 50 ? '#3B82F6'
                     : matchPct >= 30 ? '#F59E0B' : '#EF4444';
        const label  = matchPct >= 70 ? '🎉 Strong Match — Apply Now!'
                     : matchPct >= 50 ? '👍 Good Match — Tailor a Few Areas'
                     : matchPct >= 30 ? '📝 Partial Match — Needs Work'
                     : '⚠️ Low Match — Significant Gap';
        const method = (bertResult && bertResult.overallScore) ? '🧠 BERT Semantic' : '🔤 Keyword';

        let html = '<div class="jd-match-score" style="color:' + colour + '">'
            + matchPct + '% — ' + label
            + '</div>'
            + '<div style="font-size:11px;color:#6B7280;text-align:center;margin-top:4px;">Powered by ' + method + ' matching · ' + resumeTxt.length + ' chars of resume text</div>';

        // BERT semantic match results
        if (bertResult && bertResult.topMatches && bertResult.topMatches.length) {
            html += '<div style="margin-top:16px;">'
                + '<strong style="font-size:13px;color:#374151;">✅ Semantic Matches (' + bertResult.topMatches.length + ')</strong>'
                + '<div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;">';
            bertResult.topMatches.forEach(function(m) {
                html += '<div style="padding:8px 12px;background:#F0FDF4;border-radius:8px;border:1px solid #D1FAE5;font-size:12px;">'
                    + '<span style="color:#065F46;font-weight:600;">' + esc(m.jdRequirement) + '</span>'
                    + '<span style="color:#6B7280;margin:0 6px;">→</span>'
                    + '<span style="color:#047857;">' + esc(m.resumeMatch) + '</span>'
                    + '<span style="float:right;color:#10B981;font-weight:700;">' + m.score + '%</span>'
                    + '</div>';
            });
            html += '</div></div>';
        }

        if (bertResult && bertResult.gaps && bertResult.gaps.length) {
            html += '<div style="margin-top:12px;">'
                + '<strong style="font-size:13px;color:#374151;">⚠️ Gaps Detected</strong>'
                + '<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">';
            bertResult.gaps.forEach(function(g) {
                html += '<div style="padding:8px 12px;background:#FFF5F5;border-radius:8px;border:1px solid #FCA5A5;font-size:12px;color:#DC2626;">' + esc(g) + '</div>';
            });
            html += '</div></div>';
        }

        // Keyword results (always shown)
        html += '<div style="margin-top:12px;">'
            + '<strong style="font-size:13px;color:#374151;">🔤 Keyword Matches (' + kwMatched.length + ')</strong>'
            + '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">'
            + kwMatched.slice(0, 25).map(k => '<span class="keyword-tag found">' + esc(k) + '</span>').join('')
            + '</div></div>';

        if (kwMissing.length) {
            html += '<div style="margin-top:12px;">'
                + '<strong style="font-size:13px;color:#374151;">❌ Missing Keywords (' + kwMissing.length + ')</strong>'
                + '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">'
                + kwMissing.slice(0, 25).map(k => '<span class="keyword-tag missing">' + esc(k) + '</span>').join('')
                + '</div></div>';
        }

        html += '<p style="font-size:12px;color:#6B7280;margin-top:12px;">'
            + '💡 BERT understands meaning — 70%+ semantic score means you\'re a strong candidate even without exact keyword matches.</p>';

        if (results) {
            results.style.display = 'block';
            results.innerHTML = html;
        }

    } catch (err) {
        if (results) {
            results.style.display = 'block';
            results.innerHTML = '<p style="color:#EF4444;">Error: ' + esc(err.message) + '</p>';
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🎯 Match My Resume to This JD'; }
    }
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function extractKeywords(text) {
    if (!text) return [];
    const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of',
        'with','by','from','as','is','was','are','were','be','have','has','had','do',
        'will','would','should','could','may','might','can','this','that','we','you',
        'our','your','their','it','its','they','not','if','so','then','when','where']);
    return [...new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9\s\.\+#]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP.has(w))
    )];
}

async function readFileText(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload  = e => resolve((e.target.result || '').replace(/[^\x20-\x7E\n\r\t]/g, ' ').toLowerCase());
        reader.onerror = () => resolve('');
        reader.readAsText(file, 'utf-8');
    });
}

function scoreLabel(score) {
    return score >= 80 ? '🎉 Excellent' : score >= 60 ? '👍 Good' : score >= 40 ? '📝 Average' : '⚠️ Needs Work';
}

function animateBar(barId, textId, value) {
    const bar  = document.getElementById(barId);
    const text = document.getElementById(textId);
    if (bar)  { bar.style.width = '0'; setTimeout(() => { bar.style.width = value + '%'; bar.style.transition = 'width 0.8s ease'; }, 50); }
    if (text) text.textContent = value;
}

function setBar(barId, value) {
    const el = document.getElementById(barId);
    if (el) el.style.width = value + '%';
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function esc(str) {
    return String(str || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showAnalysisError(msg) {
    // Show the real backend error — never suppress it
    const errorHtml = '<div style="background:#FFF5F5;border:1px solid #FCA5A5;border-left:4px solid #EF4444;' +
        'border-radius:10px;padding:16px;margin:8px 0;">' +
        '<div style="font-weight:700;color:#DC2626;margin-bottom:8px;">❌ Analysis Error</div>' +
        '<div style="color:#DC2626;font-size:13px;word-break:break-word;">' + esc(msg) + '</div></div>';
    setHTML('issuesList', errorHtml);
    ['optimizedKeywords','missingKeywords','recommendationsList'].forEach(function(id) {
        setHTML(id, '<p style="color:#6B7280;font-size:13px;padding:8px;">See Issues section above.</p>');
    });
    setText('scoreValue',  '!');
    setText('scoreStatus', 'Error');
}

// ─────────────────────────────────────────────────────────────
// INLINE STYLES FOR NEW ELEMENTS
// ─────────────────────────────────────────────────────────────
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .loading-inline { color:#6B7280; padding:12px; font-size:14px; }

    /* Issues */
    .issue-item { padding:14px 16px; border-radius:10px; margin-bottom:10px;
        background:#F9FAFB; border:1px solid #E5E7EB; border-left:4px solid #E5E7EB; }
    .issue-item.error   { border-left-color:#EF4444; background:#FFF5F5; }
    .issue-item.warning { border-left-color:#F59E0B; background:#FFFBEB; }
    .issue-item.success { border-left-color:#10B981; background:#F0FDF4; }
    .issue-header { display:flex; gap:10px; align-items:center; margin-bottom:6px; }
    .issue-badge  { font-size:12px; font-weight:700; padding:2px 8px; border-radius:6px;
        background:rgba(0,0,0,0.06); }
    .issue-category { font-size:12px; color:#6B7280; font-weight:600; }
    .issue-message  { font-size:14px; color:#111827; font-weight:600; }
    .issue-fix      { font-size:13px; color:#059669; margin-top:6px; }

    /* Recommendations */
    .recommendation-item { display:flex; gap:14px; padding:14px; border-radius:10px;
        background:#F0FDF4; border:1px solid #D1FAE5; margin-bottom:10px; align-items:flex-start; }
    .rec-number { width:28px; height:28px; border-radius:50%; background:#10B981; color:white;
        display:flex; align-items:center; justify-content:center;
        font-weight:800; font-size:13px; flex-shrink:0; }
    .rec-text { font-size:14px; color:#111827; line-height:1.6; }

    /* Synonym card */
    .synonym-grid { display:flex; flex-direction:column; gap:10px; }
    .synonym-row  { display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        padding:10px 14px; background:#F9FAFB; border-radius:8px; }
    .syn-keyword { font-weight:700; font-size:14px; color:#111827;
        background:#D1FAE5; padding:4px 12px; border-radius:20px; }
    .syn-sep     { color:#9CA3AF; font-size:16px; }
    .syn-list    { display:flex; gap:6px; flex-wrap:wrap; }
    .syn-tag     { font-size:12px; padding:3px 10px; border-radius:14px;
        background:#EDE9FE; color:#5B21B6; border:1px solid #C4B5FD; }

    /* Bullet verb table */
    .bullet-grade { padding:12px 16px; border-radius:8px; font-size:14px; margin-bottom:16px; }
    .bullet-grade-strong { background:#D1FAE5; color:#065F46; }
    .bullet-grade-decent { background:#DBEAFE; color:#1E40AF; }
    .bullet-grade-weak   { background:#FEF3C7; color:#92400E; }
    .verb-table  { width:100%; border-collapse:collapse; font-size:13px; }
    .verb-table th { background:#F3F4F6; padding:10px 12px; text-align:left;
        font-weight:700; color:#374151; border-bottom:2px solid #E5E7EB; }
    .verb-table td { padding:10px 12px; border-bottom:1px solid #F3F4F6; vertical-align:top; }
    .verb-weak   { color:#DC2626; font-weight:600; }
    .verb-strong { color:#059669; font-weight:600; }
    .verb-impact { color:#6B7280; font-size:12px; }

    /* JD match score */
    .jd-match-score { font-size:26px; font-weight:900; font-family:'JetBrains Mono',monospace;
        text-align:center; padding:16px; }
    `;
    document.head.appendChild(style);
})();