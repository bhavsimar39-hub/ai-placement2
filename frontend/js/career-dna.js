// API_BASE set globally by config.js
let careerData = null;

async function analyzeCareerDNA(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ File exceeds 10MB limit');
        return;
    }

    // All file types accepted — input accept attr handles filtering

    const token = localStorage.getItem('token');
    if (!token) {
        alert('🔒 Please login first');
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('loadingOverlay').classList.add('active');

    try {
        const formData = new FormData();
        formData.append('resume', file);

        // If image processed by Vision engine, send extracted text to backend
        if (window.__isImageResume && window.__resumeText) {
            formData.append('extractedText', window.__resumeText);
        }

        const response = await fetch(`${API_BASE}/career-dna/analyze-dna`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        if (!data.success) throw new Error(data.message || 'Analysis failed');

        careerData = data.analysis;

        // ── Save to localStorage for dashboard ───────────────
        localStorage.setItem('career_score',   careerData.careerScore    || 0);
        localStorage.setItem('career_level',   careerData.careerLevel    || '--');
        localStorage.setItem('resume_status',  'Uploaded ✔');
        localStorage.setItem('readiness_score', careerData.careerScore   || 0);
        // Save top career path for job match card
        if (careerData.careerPaths && careerData.careerPaths.length > 0) {
            localStorage.setItem('top_job_role',    careerData.careerPaths[0].role);
            localStorage.setItem('job_match_count', careerData.careerPaths.length);
        }
        // Save skills found
        if (careerData.skills && careerData.skills.length > 0) {
            localStorage.setItem('skills_found', JSON.stringify(careerData.skills.slice(0, 20)));
        }

        document.getElementById('heroSection').style.display = 'none';
        document.getElementById('analysisContainer').classList.add('active');

        displayResults(careerData);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        let msg = 'Analysis failed';
        if (error.message.includes('fetch')) {
            msg = '🔌 Cannot connect to server (port 5000)';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            msg = '🔒 Session expired. Redirecting to login...';
            setTimeout(() => window.location.href = '/login.html', 2000);
        } else {
            // Show the REAL backend error — never hide it
            msg = error.message;
        }
        alert(msg);
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

function displayResults(data) {
    // Stats
    animateNumber('experienceYears', data.experienceYears || 0);
    animateNumber('skillsCount', data.skillCount || 0);
    animateNumber('careerScore', data.careerScore || 0);
    
    document.getElementById('salaryRange').textContent = data.salaryEstimate?.range || '-';
    document.getElementById('careerLevel').textContent = data.careerLevel || '-';

    // Skills
    const skillsGrid = document.getElementById('skillsGrid');
    if (data.skills && data.skills.length > 0) {
        skillsGrid.innerHTML = data.skills.slice(0, 40).map(s => 
            `<div class="skill-tag">${s}</div>`
        ).join('');
    } else {
        skillsGrid.innerHTML = '<div style="color:var(--text-muted)">No skills detected</div>';
    }

    // Career Paths
    if (data.careerPaths && data.careerPaths.length > 0) {
        document.getElementById('pathsSection').style.display = 'block';
        document.getElementById('pathsGrid').innerHTML = data.careerPaths.map(p => `
            <div class="path-card">
                <div class="path-role">${p.role}</div>
                <div class="path-meta">
                    <span class="path-badge">Fit: ${p.fit}</span>
                    <span class="path-badge">Demand: ${p.demand}</span>
                </div>
            </div>
        `).join('');
    }

    // Skill Gaps
    if (data.skillGaps && data.skillGaps.length > 0) {
        document.getElementById('gapsSection').style.display = 'block';
        document.getElementById('gapsContainer').innerHTML = data.skillGaps.map(g => `
            <div class="gap-item">
                <div class="gap-info">
                    <div class="gap-skill">${g.skill}</div>
                    <div class="gap-reason">${g.reason}</div>
                </div>
                <span class="priority-badge priority-${g.priority.toLowerCase()}">${g.priority}</span>
            </div>
        `).join('');
    }

    // Strengths & Weaknesses
    if (data.strengths || data.weaknesses) {
        document.getElementById('swSection').style.display = 'block';
        
        if (data.strengths && data.strengths.length > 0) {
            document.getElementById('strengthsContainer').innerHTML = data.strengths.map(s => 
                `<div class="sw-item">✅ ${s}</div>`
            ).join('');
        }
        
        if (data.weaknesses && data.weaknesses.length > 0) {
            document.getElementById('weaknessesContainer').innerHTML = data.weaknesses.map(w => 
                `<div class="sw-item">📊 ${w}</div>`
            ).join('');
        }
    }

    // Experience
    const timeline = document.getElementById('timeline');
    if (data.experience && data.experience.length > 0) {
        timeline.innerHTML = data.experience.map(e => `
            <div class="timeline-item">
                <div class="timeline-year">${e.duration || 'Present'}</div>
                <div class="timeline-title">${e.title || 'Position'}</div>
                <div class="timeline-company">${e.company || ''}</div>
                ${e.description ? `<div class="timeline-description">${e.description.substring(0,200)}${e.description.length>200?'...':''}</div>` : ''}
            </div>
        `).join('');
    } else {
        timeline.innerHTML = '<div style="color:var(--text-muted)">No experience found</div>';
    }

    // Education
    const eduContainer = document.getElementById('educationContainer');
    const allEdu = [...(data.education || []), ...(data.certifications || [])];
    if (allEdu.length > 0) {
        eduContainer.innerHTML = allEdu.map(e => `
            <div class="achievement-item">
                <div class="achievement-text">
                    <strong>${e.degree || e.certification || e.name || 'Degree'}</strong>
                    ${e.year ? ` • ${e.year}` : ''}
                </div>
            </div>
        `).join('');
    } else {
        eduContainer.innerHTML = '<div style="color:var(--text-muted)">No education found</div>';
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
        document.getElementById('achSection').style.display = 'block';
        document.getElementById('achievementsContainer').innerHTML = data.achievements.map(a => `
            <div class="achievement-item">
                <div class="achievement-text">${a}</div>
            </div>
        `).join('');
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        document.getElementById('projSection').style.display = 'block';
        document.getElementById('projectsContainer').innerHTML = data.projects.map(p => `
            <div class="achievement-item">
                <div class="achievement-text">
                    <strong>${p.name}</strong>
                    ${p.desc ? `<br>${p.desc}` : ''}
                </div>
            </div>
        `).join('');
    }

    // Insights
    const insightsContainer = document.getElementById('insightsContainer');
    if (data.insights && data.insights.length > 0) {
        insightsContainer.innerHTML = data.insights.map(i => {
            if (typeof i === 'string') {
                return `<div class="achievement-item"><div class="achievement-text">${i}</div></div>`;
            } else {
                return `
                    <div class="achievement-item">
                        <div class="achievement-text">
                            <strong>${i.icon} ${i.title}:</strong> ${i.text}
                        </div>
                    </div>
                `;
            }
        }).join('');
    } else {
        insightsContainer.innerHTML = `
            <div class="achievement-item">
                <div class="achievement-text">💼 <strong>Experience:</strong> ${data.experienceYears || 0} years at ${data.careerLevel} level</div>
            </div>
            <div class="achievement-item">
                <div class="achievement-text">🛠️ <strong>Skills:</strong> ${data.skillCount || 0} technical competencies detected</div>
            </div>
            <div class="achievement-item">
                <div class="achievement-text">📈 <strong>Score:</strong> Career readiness score of ${data.careerScore}/100</div>
            </div>
        `;
    }

    // Recommendations
    const recsContainer = document.getElementById('recommendationsContainer');
    if (data.recommendations && data.recommendations.length > 0) {
        recsContainer.innerHTML = data.recommendations.map(r => `
            <div class="rec-item">
                <span class="priority-badge priority-${r.priority}">${r.priority}</span>
                <div class="rec-text">${r.text}</div>
            </div>
        `).join('');
    } else {
        recsContainer.innerHTML = '<div style="color:var(--text-muted)">No recommendations</div>';
    }
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const inc = Math.max(1, Math.ceil(target / 50));
    const duration = 1500;
    const step = duration / (target / inc);
    const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.round(current);
        }
    }, step);
}

function resetAnalyzer() {
    document.getElementById('analysisContainer').classList.remove('active');
    document.getElementById('heroSection').style.display = 'flex';
    document.getElementById('resumeFile').value = '';
    careerData = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =============================================
   NLP PERSONALITY INTELLIGENCE ENGINE — Phase 4
   Triggers after existing Career DNA analysis
   Adds: Archetype, Personality Traits, Work Style, Role Fit
============================================= */


// Safe response parser
function parseDnaResponse(data) {
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('Empty AI response — check GROQ_API_KEY in .env');
    }
    return data.content[0].text || '';
}

async function callDnaGroq(prompt) {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(API_BASE + '/nlp/claude', {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
    });
    if (!res.ok) throw new Error(`NLP API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return parseDnaResponse(data);
}

// Hook into existing analyzeCareerDNA to capture file text
// Hook into displayResults to trigger NLP personality after results render
const _origDisplay = window.displayResults;
window.displayResults = function(data) {
    _origDisplay.apply(this, arguments);
    const nlpSection = document.getElementById('dnaNlpSection');
    if (nlpSection) {
        nlpSection.style.display = 'block';
        setTimeout(() => runDnaPersonality(data), 800);
    }
};

async function runDnaPersonality(data) {
    // Build rich context from careerData — NOT from raw file (PDF binary is unreadable)
    const skills      = (data.skills || []).slice(0, 20).join(', ');
    const experience  = (data.experience || []).slice(0, 3).map(e =>
        `${e.title || ''} ${e.company ? 'at ' + e.company : ''} ${e.duration || ''}`
    ).join(' | ');
    const education   = (data.education || []).slice(0, 2).map(e =>
        e.degree || e.certification || ''
    ).join(', ');
    const achievements = (data.achievements || []).slice(0, 3).join('. ');
    const projects    = (data.projects || []).slice(0, 3).map(p => p.name || '').join(', ');

    const context = [
        `Skills: ${skills || 'Not detected'}`,
        `Experience: ${experience || 'Not detected'}`,
        `Career Level: ${data.careerLevel || 'Unknown'}`,
        `Experience Years: ${data.experienceYears || 0}`,
        `Education: ${education || 'Not detected'}`,
        achievements ? `Achievements: ${achievements}` : '',
        projects     ? `Projects: ${projects}`         : '',
    ].filter(Boolean).join('\n');

    const delay = ms => new Promise(r => setTimeout(r, ms));

    await runArchetype(context, data);
    await delay(1500);
    await runPersonalityTraits(context);
    await delay(1500);
    await runWorkStyle(context, data);
    await delay(1500);
    await runRoleFit(context, data);
}

// ── 1. CAREER ARCHETYPE ──
async function runArchetype(context, data) {
    const el = document.getElementById('dnaArchetypeBody');
    try {
        const prompt = `Based on this resume, identify the person's career archetype. Return ONLY valid JSON:
Professional Profile:
${context.substring(0, 2000)}
Skills: ${(data.skills||[]).slice(0,10).join(', ')}
Level: ${data.careerLevel || 'unknown'}

{"archetype":"The Innovator","emoji":"🚀","tagline":"Builds what others imagine","description":"You are driven by creating new solutions and challenging the status quo. Your resume shows a pattern of building, launching and iterating on products and systems. You thrive in fast-paced environments where creativity meets technical execution.","strengths":["Creative problem solving","Technical depth","Self-driven","Adaptable"],"best_environments":["Startups","R&D teams","Product companies","Innovation labs"]}`;

        const raw = await callDnaGroq(prompt);
        const r = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

        el.innerHTML = `
            <div class="archetype-wrap">
                <div class="archetype-emoji">${r.emoji || '🎯'}</div>
                <div>
                    <div class="archetype-name">${r.archetype}</div>
                    <div class="archetype-tagline">"${r.tagline}"</div>
                    <div class="archetype-desc">${r.description}</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:4px;">
                <div style="padding:16px;border-radius:12px;background:var(--bg-darker);border:1px solid var(--border);">
                    <div style="font-size:13px;font-weight:800;color:var(--text-light);margin-bottom:10px;">💪 Core Strengths</div>
                    ${(r.strengths||[]).map(s=>`<div style="font-size:13px;color:var(--text-muted);padding:5px 0;border-bottom:1px solid var(--border);">✅ ${s}</div>`).join('')}
                </div>
                <div style="padding:16px;border-radius:12px;background:var(--bg-darker);border:1px solid var(--border);">
                    <div style="font-size:13px;font-weight:800;color:var(--text-light);margin-bottom:10px;">🏢 Best Environments</div>
                    ${(r.best_environments||[]).map(e=>`<div style="font-size:13px;color:var(--text-muted);padding:5px 0;border-bottom:1px solid var(--border);">🎯 ${e}</div>`).join('')}
                </div>
            </div>`;
    } catch(e) {
        el.innerHTML = `<div style="color:#EF4444;padding:16px;">Archetype detection failed: ${e.message}</div>`;
    }
}

// ── 2. PERSONALITY TRAITS ──
async function runPersonalityTraits(context) {
    const el = document.getElementById('dnaTraitsBody');
    try {
        const prompt = `Analyze personality traits from this resume's writing style and content. Return ONLY valid JSON:
Professional Profile:
${context.substring(0, 2000)}

{"traits":[{"name":"Analytical Thinking","emoji":"🔬","score":82,"color":"#10B981","desc":"Strong evidence of data-driven decision making"},{"name":"Leadership","emoji":"👑","score":65,"color":"#6366F1","desc":"Shows team coordination and project ownership"},{"name":"Creativity","emoji":"🎨","score":58,"color":"#F59E0B","desc":"Some innovative approaches mentioned"},{"name":"Communication","emoji":"💬","score":75,"color":"#06B6D4","desc":"Clear and structured writing style"}]}

Replace scores and descriptions based on the actual resume. Keep exact field names.`;

        const raw = await callDnaGroq(prompt);
        const r = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

        el.innerHTML = `
            <div class="trait-grid">
                ${(r.traits||[]).map(t => `
                    <div class="trait-card">
                        <div class="trait-emoji">${t.emoji}</div>
                        <div class="trait-name">${t.name}</div>
                        <div class="trait-desc">${t.desc}</div>
                        <div class="trait-bar-bg">
                            <div class="trait-bar-fill" style="background:${t.color};" data-width="${t.score}"></div>
                        </div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:5px;text-align:right;font-family:monospace;">${t.score}%</div>
                    </div>`).join('')}
            </div>`;

        setTimeout(() => {
            document.querySelectorAll('.trait-bar-fill').forEach(b => b.style.width = b.dataset.width + '%');
        }, 200);
    } catch(e) {
        el.innerHTML = `<div style="color:#EF4444;padding:16px;">Personality analysis failed: ${e.message}</div>`;
    }
}

// ── 3. WORK STYLE DNA ──
async function runWorkStyle(context, data) {
    const el = document.getElementById('dnaStyleBody');
    try {
        const prompt = `Analyze work style preferences from this resume. Return ONLY valid JSON:
Professional Profile:
${context.substring(0, 2000)}
Experience: ${data.experienceYears || 0} years, Level: ${data.careerLevel || 'unknown'}

{"summary":"You prefer structured environments with clear ownership but enjoy creative problem-solving within those boundaries.","styles":[{"icon":"🤝","label":"Collaboration","score":72,"color":"#10B981"},{"icon":"🎯","label":"Goal Orientation","score":88,"color":"#6366F1"},{"icon":"⚡","label":"Work Pace","score":65,"color":"#F59E0B"},{"icon":"🔧","label":"Technical Depth","score":90,"color":"#06B6D4"},{"icon":"📊","label":"Data-Driven","score":78,"color":"#EF4444"},{"icon":"🌱","label":"Growth Mindset","score":82,"color":"#10B981"}]}

Replace scores based on the actual resume. Keep exact field names.`;

        const raw = await callDnaGroq(prompt);
        const r = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

        el.innerHTML = `
            <div style="padding:14px 16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;margin-bottom:20px;">
                <div style="font-size:14px;color:var(--text-muted);">${r.summary}</div>
            </div>
            ${(r.styles||[]).map(s => `
                <div class="style-row">
                    <div class="style-icon">${s.icon}</div>
                    <div class="style-label">${s.label}</div>
                    <div class="style-bar-bg">
                        <div class="style-bar-fill" style="background:${s.color};" data-width="${s.score}"></div>
                    </div>
                    <div class="style-val">${s.score}%</div>
                </div>`).join('')}`;

        setTimeout(() => {
            document.querySelectorAll('.style-bar-fill').forEach(b => b.style.width = b.dataset.width + '%');
        }, 200);
    } catch(e) {
        el.innerHTML = `<div style="color:#EF4444;padding:16px;">Work style analysis failed: ${e.message}</div>`;
    }
}

// ── 4. ROLE FIT MATRIX ──
async function runRoleFit(context, data) {
    const el = document.getElementById('dnaRoleBody');
    try {
        const prompt = `Score how well this person fits different roles based on their resume personality and skills. Return ONLY valid JSON:
Professional Profile:
${context.substring(0, 2000)}
Skills: ${(data.skills||[]).slice(0,10).join(', ')}

{"best_role":"Senior Software Engineer","roles":[{"emoji":"💻","title":"Software Engineer","score":91},{"emoji":"🏗️","title":"Tech Lead","score":78},{"emoji":"📊","title":"Data Scientist","score":65},{"emoji":"🎨","title":"UI/UX Designer","score":32},{"emoji":"📢","title":"Product Manager","score":58},{"emoji":"🔐","title":"Security Engineer","score":44},{"emoji":"☁️","title":"DevOps Engineer","score":55},{"emoji":"🤖","title":"ML Engineer","score":62},{"emoji":"📱","title":"Mobile Developer","score":48}]}

Replace scores based on the actual resume. Keep exact field names.`;

        const raw = await callDnaGroq(prompt);
        const r = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
        const roles = (r.roles || []).sort((a,b) => b.score - a.score);
        const topScore = roles[0]?.score || 0;

        el.innerHTML = `
            <div style="padding:12px 16px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:10px;margin-bottom:18px;">
                <div style="font-size:14px;font-weight:700;color:var(--text-light);">🏆 Best Role Match: ${r.best_role || roles[0]?.title || 'See below'}</div>
            </div>
            <div class="role-grid">
                ${roles.map((role, i) => `
                    <div class="role-card ${role.score === topScore ? 'top-role' : ''}">
                        <div class="role-emoji">${role.emoji}</div>
                        <div class="role-title">${role.title}</div>
                        <div class="role-score">${role.score}%</div>
                        <div class="role-label">fit score</div>
                    </div>`).join('')}
            </div>`;
    } catch(e) {
        el.innerHTML = `<div style="color:#EF4444;padding:16px;">Role fit analysis failed: ${e.message}</div>`;
    }
}