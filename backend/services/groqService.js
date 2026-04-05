// backend/services/groqService.js
// Shared Groq LLM service — used by ATS, Resume Upload, and NLP Analyzer
// Model: llama-3.3-70b-versatile

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

// ── Core Groq call ────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt, maxTokens = 1500) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not set in .env");

    const res = await fetch(GROQ_API, {
        method:  "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            model:       MODEL,
            max_tokens:  maxTokens,
            temperature: 0.3,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user",   content: userPrompt   },
            ],
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Groq API error ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

// ── Safe JSON parse from LLM output ──────────────────────
function parseJSON(raw) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in Groq response");
    return JSON.parse(match[0]);
}

// ═══════════════════════════════════════════════════════════
// 1. ATS ANALYSIS — replaces performATSAnalysis()
// ═══════════════════════════════════════════════════════════
export async function groqATSAnalysis(resumeText) {
    const system = `You are an expert ATS (Applicant Tracking System) analyzer. 
Analyze resumes and return ONLY valid JSON — no markdown, no explanation.`;

    const prompt = `Analyze this resume for ATS compatibility. Return ONLY this exact JSON structure:
{
  "score": <0-100 overall ATS score>,
  "analysis": {
    "formatScore": <0-100>,
    "keywordScore": <0-100>,
    "structureScore": <0-100>,
    "contentScore": <0-100>
  },
  "issues": [
    {"type": "error|warning", "category": "Structure|Keywords|Contact|Formatting|Content", "message": "...", "fix": "..."}
  ],
  "recommendations": ["actionable recommendation 1", "..."],
  "optimizedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "strengths": ["strength1", "strength2"],
  "summary": "2-sentence overall assessment"
}

Rules:
- issues array: max 8 items, prioritize critical problems
- recommendations: max 6 actionable items  
- optimizedKeywords: skills/keywords found in resume (max 20)
- missingKeywords: important keywords absent (max 10)
- Be specific and actionable, not generic

Resume text:
${resumeText.substring(0, 4000)}`;

    try {
        const raw  = await callGroq(system, prompt, 2000);
        const data = parseJSON(raw);
        return {
            score:             Math.min(100, Math.max(0, data.score || 0)),
            analysis:          data.analysis        || { formatScore:0, keywordScore:0, structureScore:0, contentScore:0 },
            issues:            data.issues          || [],
            recommendations:   data.recommendations  || [],
            optimizedKeywords: data.optimizedKeywords || [],
            missingKeywords:   data.missingKeywords   || [],
            strengths:         data.strengths        || [],
            summary:           data.summary          || "",
            groqPowered:       true,
        };
    } catch (e) {
        return null; // caller falls back to rule-based
    }
}

// ═══════════════════════════════════════════════════════════
// 2. RESUME DEEP ANALYSIS — primary driver for resumeController
// ═══════════════════════════════════════════════════════════
export async function groqResumeAnalysis(resumeText) {
    const system = `You are an expert resume analyst and career coach with 15+ years of experience.
Extract structured data from resumes with maximum accuracy. Return ONLY valid JSON — no markdown, no backticks.`;

    const prompt = `Analyze this resume thoroughly. Return ONLY this exact JSON (no markdown, no extra text):
{
  "skills": ["every technical skill found — be exhaustive"],
  "skillsByCategory": {
    "languages": [], "frontend": [], "backend": [], "databases": [],
    "cloud_devops": [], "ai_ml": [], "mobile": [], "tools": [],
    "security": [], "soft_skills": []
  },
  "experienceYears": <integer — estimate from date ranges or explicit mentions>,
  "experienceLevel": "Fresher / Entry Level|Junior (1-3 years)|Mid-level (3-6 years)|Senior (6-10 years)|Principal / Staff (10+ years)",
  "contactInfo": {
    "name": "candidate full name — look at the very top of the resume",
    "email": "email address or null",
    "phone": "phone number or null",
    "linkedin": "linkedin URL or null",
    "github": "github URL or null",
    "location": "city/country if mentioned or null"
  },
  "education": {
    "highestDegree": "PhD|Master's|MBA|Bachelor's|Associate|Certificate|Secondary|Not detected",
    "degrees": ["degree 1", "degree 2"],
    "institutions": ["institution names found"]
  },
  "certifications": ["certification 1", "certification 2"],
  "achievements": ["specific quantified achievement 1", "achievement 2"],
  "atsScore": <0-100, score based on keywords, structure, contact info, metrics>,
  "strengths": ["specific strength from THIS resume", "another specific strength"],
  "weaknesses": ["specific gap from THIS resume", "another specific gap"],
  "tone": {
    "score": <0-100>,
    "label": "Professional|Technical|Casual|Confident|Weak",
    "emoji": "💼|🚀|📝|⚠️",
    "description": "One specific sentence about the writing style of THIS resume",
    "issues": ["specific writing issue 1", "specific writing issue 2"]
  },
  "verbs": [
    {"weak": "actual weak verb found in resume", "strong": "better alternative", "context": "where it appears"},
    {"weak": "another weak verb", "strong": "replacement", "context": "context"}
  ],
  "flags": [
    {"type": "error|warning|success", "icon": "🚨|⚠️|✅", "text": "specific observation about THIS resume"},
    {"type": "success", "icon": "✅", "text": "specific strength found"},
    {"type": "warning", "icon": "⚠️", "text": "specific improvement needed"}
  ],
  "summary": "2-sentence specific profile summary based on what is actually in this resume"
}

Rules:
- skills: list EVERY technology, tool, language, framework you see — aim for completeness
- verbs: only list weak verbs that actually appear in the resume text
- flags: be specific to THIS resume — no generic advice
- contactInfo.name: this is critical — find the candidate's name at the top of the resume
- atsScore: be honest — missing contact info, no metrics, poor structure = lower score

Resume:
${resumeText.substring(0, 4500)}`;

    try {
        const raw  = await callGroq(system, prompt, 2500);
        const data = parseJSON(raw);
        return { ...data, groqPowered: true };
    } catch (e) {
        console.warn("groqResumeAnalysis failed:", e.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// 3. NLP DEEP ANALYSIS — enhances nlpController
// ═══════════════════════════════════════════════════════════
export async function groqNLPAnalysis(resumeText, jobDescription = null) {
    const system = `You are a senior technical recruiter and NLP resume analyst with 15+ years of experience.
Your task is to perform an exhaustive, highly accurate analysis of a resume.

Rules:
- Be SPECIFIC: mention actual skill names, job titles, company types from the resume — never generic
- Be HONEST: if the resume has real problems, flag them clearly
- Scoring: base overallScore on content quality, specificity, impact language, and completeness
- Skills: extract EVERY technical skill, tool, framework, language, platform you see
- Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON`;

    const jdSection = jobDescription
        ? `\n\nJob Description (match against this):\n${jobDescription.substring(0, 1500)}`
        : "";

    const prompt = `Perform a deep, accurate NLP analysis of this resume. Return ONLY this exact JSON structure:
{
  "overallScore": <0-100, honest score based on impact, completeness, specificity>,
  "skills": ["every", "skill", "found"],
  "detailedSkills": [
    {"skill": "React", "category": "frontend",    "proficiency": "Experienced"},
    {"skill": "Python", "category": "languages",  "proficiency": "Proficient"},
    {"skill": "AWS",    "category": "cloud",       "proficiency": "Familiar"}
  ],
  "skillsByCategory": {
    "languages":   [],
    "frontend":    [],
    "backend":     [],
    "databases":   [],
    "cloud":       [],
    "dataScience": [],
    "mobile":      [],
    "testing":     [],
    "tools":       []
  },
  "experienceYears": <number, estimate from dates or context>,
  "atsScore": <0-100>,
  "sentiment": "positive|neutral|negative",
  "writingQuality": "excellent|good|average|poor",
  "keyPhrases": ["impactful phrases found in resume"],
  "actionVerbs": ["strong verbs found like led, built, architected"],
  "recommendations": [
    {
      "category": "Skills|Experience|Format|Content|Keywords",
      "priority": "high|medium|low",
      "message": "Specific, actionable observation about THIS resume",
      "action": "Exact step to improve it"
    }
  ],
  "jobMatch": ${jobDescription ? `{
    "score": <0-100>,
    "level": "Excellent|Good|Fair|Poor",
    "matchingSkills": ["skills that match the JD"],
    "missingSkills": ["skills in JD not found in resume"],
    "recommendation": "Specific advice to improve match"
  }` : "null"},
  "insights": [
    "Specific insight about this candidate's profile",
    "Another specific insight"
  ],
  "improvements": [
    "Specific improvement #1 with context from the resume",
    "Specific improvement #2"
  ]
}

Categories for detailedSkills: languages, frontend, backend, databases, cloud, dataScience, mobile, testing, tools
Proficiency levels: Expert, Experienced, Proficient, Familiar (infer from context/years of use if mentioned)

Resume:${jdSection}
${resumeText.substring(0, 4000)}`;

    try {
        const raw  = await callGroq(system, prompt, 3000);
        const data = parseJSON(raw);
        return { ...data, groqPowered: true };
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// 4. GROQ SKILL EXTRACTION — quick focused call
// ═══════════════════════════════════════════════════════════
export async function groqExtractSkills(resumeText) {
    const system = `Extract technical skills from resume text. Return ONLY valid JSON.`;
    const prompt = `List all technical skills in this resume. Return ONLY:
{"skills": ["skill1", "skill2", ...], "categories": {"languages":[], "frameworks":[], "tools":[], "cloud":[], "databases":[], "other":[]}}

Resume: ${resumeText.substring(0, 2000)}`;

    try {
        const raw  = await callGroq(system, prompt, 800);
        return parseJSON(raw);
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// 5. SKILL GAP NLP INSIGHTS — career-specific gap analysis
// ═══════════════════════════════════════════════════════════
export async function groqSkillGapInsights({ matchedSkills, missingSkills, readinessScore, grade, trackTitle, companyName }) {
    const system = `You are a senior career coach and technical recruiter. Given a skill gap analysis result, 
generate precise, honest, and encouraging career insights. Return ONLY valid JSON — no markdown, no backticks, no extra text.`;

    const target   = companyName ? `${companyName} (${trackTitle})` : trackTitle;
    const hasGap   = missingSkills.length > 0;

    const prompt = `A candidate is targeting: ${target}

Skill gap result:
- Readiness: ${readinessScore}% — Grade: ${grade}
- Skills they HAVE (${matchedSkills.length}): ${matchedSkills.join(", ") || "none matched"}
- Skills MISSING (${missingSkills.length}): ${missingSkills.join(", ") || "none — fully ready!"}

Return ONLY this exact JSON (no markdown, no preamble):
{
  "headline": "One punchy sentence (max 12 words) that captures this candidate's current position",
  "narrative": "2-3 sentences honest about the gap and what it means for job prospects — be direct and specific to these exact skills",
  "prioritySkills": [
    {"skill": "most important missing skill name", "reason": "why it is the #1 priority for this specific role", "estimatedWeeks": <1-12>},
    {"skill": "second most important missing skill", "reason": "specific reason", "estimatedWeeks": <1-12>}
  ],
  "strengthsSummary": "One sentence about how their existing matched skills position them well",
  "marketInsight": "One specific sentence about hiring demand or competition reality for ${target}",
  "weekOneAction": "The single most impactful action they can take in the next 7 days — be specific (e.g. 'Complete the official React docs tutorial and build a to-do app')",
  "competitiveEdge": "One sentence: what unique advantage they will have over other candidates once the gap is closed"
}

Rules:
- prioritySkills: pick only from the missing skills list; return max 3 items; if no missing skills return []
- All text must reference the actual skills listed — zero generic advice
- estimatedWeeks: realistic estimate (e.g. Docker=2, Machine Learning=10, React=4)
- If missingSkills is empty, make the headline celebratory and prioritySkills an empty array`;

    try {
        const raw  = await callGroq(system, prompt, 1000);
        const data = parseJSON(raw);
        return {
            headline:        data.headline        || "",
            narrative:       data.narrative        || "",
            prioritySkills:  Array.isArray(data.prioritySkills) ? data.prioritySkills : [],
            strengthsSummary: data.strengthsSummary || "",
            marketInsight:   data.marketInsight    || "",
            weekOneAction:   data.weekOneAction    || "",
            competitiveEdge: data.competitiveEdge  || "",
            groqPowered:     true,
        };
    } catch (e) {
        return null; // caller handles gracefully — non-fatal
    }
}
// ═══════════════════════════════════════════════════════════
// 6. JOB MATCH NLP INSIGHTS — career narrative for top matches
// ═══════════════════════════════════════════════════════════
export async function groqJobMatchInsights({ skills, topMatches }) {
    const system = `You are an expert career counsellor and technical recruiter with 15+ years of experience.
Given a candidate's skills and their top job matches, generate precise and actionable career insights.
Return ONLY valid JSON — no markdown, no backticks, no extra text.`;

    const top3 = topMatches.slice(0, 3).map(j => ({
        role:         j.role,
        domain:       j.domain,
        score:        j.matchScore,
        salary:       j.salary,
        missing:      (j.missingSkills || []).slice(0, 5),
        matched:      (j.matchedSkills || []).slice(0, 6),
    }));

    const prompt = `Candidate skills (${skills.length} total): ${skills.join(", ")}

Top matched roles:
${top3.map((j, i) => `${i + 1}. ${j.role} (${j.domain}) — ${j.score}% match · ${j.salary}
   Matched: ${j.matched.join(", ") || "none"}
   Missing: ${j.missing.join(", ") || "none"}`).join("\n")}

Return ONLY this exact JSON:
{
  "headline": "One punchy 10-12 word headline about this candidate's career positioning based on their skills",
  "profileSummary": "2-3 sentences describing this candidate's profile archetype and what roles they're best wired for — be specific to the actual skills listed",
  "bestFitRole": {
    "role": "${top3[0]?.role || ""}",
    "why": "2 specific sentences explaining why this role is the best match — reference actual skills they have",
    "salaryExpectation": "${top3[0]?.salary || ""}",
    "readinessLevel": "Ready to apply|Need 1-2 skills|Need upskilling"
  },
  "skillStrengths": ["specific strength 1 drawn from their skills", "specific strength 2", "specific strength 3"],
  "criticalGaps": [
    {"skill": "most important missing skill across all top roles", "impactedRoles": <number of roles it would unlock>, "estimatedWeeks": <1-12>},
    {"skill": "second most valuable missing skill", "impactedRoles": <number>, "estimatedWeeks": <weeks>}
  ],
  "marketOpportunity": "One specific sentence about the hiring market for this candidate's skill combination right now",
  "weekOneAction": "The single most impactful concrete action in the next 7 days — be specific to their exact skill gaps",
  "hiddenOpportunity": "One non-obvious role or domain their skills also suit well, that they may not have considered"
}

Rules:
- Be specific to the actual skills listed — zero generic advice
- criticalGaps: pick skills that appear in multiple top role missing lists; max 3 items
- estimatedWeeks: realistic (Python=8, Docker=2, React=4, System Design=6)
- readinessLevel: be honest based on the match score
- If score >= 75 use "Ready to apply"; 50-74 use "Need 1-2 skills"; <50 use "Need upskilling"`;

    try {
        const raw  = await callGroq(system, prompt, 1200);
        const data = parseJSON(raw);
        return {
            headline:         data.headline          || "",
            profileSummary:   data.profileSummary    || "",
            bestFitRole:      data.bestFitRole        || null,
            skillStrengths:   Array.isArray(data.skillStrengths) ? data.skillStrengths : [],
            criticalGaps:     Array.isArray(data.criticalGaps)   ? data.criticalGaps   : [],
            marketOpportunity: data.marketOpportunity || "",
            weekOneAction:    data.weekOneAction      || "",
            hiddenOpportunity: data.hiddenOpportunity || "",
            groqPowered:      true,
        };
    } catch (e) {
        return null; // non-fatal — caller handles gracefully
    }
}
// ═══════════════════════════════════════════════════════════
// 7. ROADMAP AI INSIGHTS — personalized coaching card
// Called after roadmap generation with user's questionnaire answers
// ═══════════════════════════════════════════════════════════
export async function groqRoadmapInsights({ role, answers, knownLanguages, personalizedRoadmap, bertSkillMatch }) {
    const system = `You are an expert career coach and learning path advisor with 15+ years of experience.
Given a learner's profile and their personalized learning roadmap, generate precise, motivating, and actionable insights.
Return ONLY valid JSON — no markdown, no backticks, no extra text.`;

    const experienceLevel  = answers[0] || "Not specified";
    const timeCommitment   = answers[2] || "Not specified";
    const learningStyle    = answers[3] || "Not specified";
    const specificInterest = answers[4] || "Not specified";
    const totalMonths      = personalizedRoadmap.totalMonths || "?";
    const phases           = (personalizedRoadmap.phases || []).map(p => p.name).join(", ");

    const bertSection = bertSkillMatch
        ? `\nBERT Semantic Skill Analysis:\n- Already matched skills: ${(bertSkillMatch.matched || []).join(", ") || "none"}\n- Partially matching skills: ${(bertSkillMatch.partial || []).join(", ") || "none"}\n- Skills to learn: ${(bertSkillMatch.missing || []).slice(0, 8).join(", ") || "none"}`
        : "";

    const prompt = `Learner Profile:
- Target Role: ${role}
- Experience Level: ${experienceLevel}
- Known Languages/Tools: ${knownLanguages.length ? knownLanguages.join(", ") : "None — complete beginner"}
- Weekly Time Available: ${timeCommitment}
- Preferred Learning Style: ${learningStyle}
- Specific Interest: ${specificInterest}
- Roadmap Duration: ${totalMonths} months
- Phases: ${phases}${bertSection}

Return ONLY this exact JSON (no markdown, no preamble):
{
  "headline": "One punchy sentence (max 12 words) addressing this specific learner by their experience and goal",
  "readinessScore": <0-100 — how ready they are RIGHT NOW based on known languages and experience>,
  "readinessLabel": "Beginner|Novice|Intermediate|Advanced|Expert",
  "personalizedSummary": "2-3 sentences honest about their starting point, realistic expectations, and what makes their path unique — reference their actual experience and known languages",
  "biggestStrength": "One specific sentence about their biggest existing advantage for this role",
  "biggestChallenge": "One specific sentence about the hardest obstacle they will face — be honest and direct",
  "weekOneAction": "The single most impactful concrete action in their first 7 days — specific to their profile (e.g. not just 'start coding' but a named resource, concept, or mini-project)",
  "learningStyleTip": "One tip tailored to their stated learning style on how to get the most from their roadmap",
  "timelineTip": "One sentence adjusting expectations based on their time commitment",
  "motivationalNote": "One genuine, specific motivational note for this exact learner — not generic. Reference their background.",
  "priorityPhase": "Which phase name they should focus on hardest and why — one sentence",
  "skipOpportunity": "Which phase or skill they can move through faster due to existing knowledge — or null if none"
}

Rules:
- readinessScore: be honest — 0 for complete beginners, 80+ only if they already know most required skills
- All text must reference the actual profile — zero generic advice
- skipOpportunity: return null (not the string "null") if no prior knowledge applies`;

    try {
        const raw  = await callGroq(system, prompt, 1500);
        const data = parseJSON(raw);
        return {
            headline:           data.headline           || "",
            readinessScore:     Math.min(100, Math.max(0, data.readinessScore || 0)),
            readinessLabel:     data.readinessLabel     || "Beginner",
            personalizedSummary: data.personalizedSummary || "",
            biggestStrength:    data.biggestStrength    || "",
            biggestChallenge:   data.biggestChallenge   || "",
            weekOneAction:      data.weekOneAction       || "",
            learningStyleTip:   data.learningStyleTip   || "",
            timelineTip:        data.timelineTip         || "",
            motivationalNote:   data.motivationalNote    || "",
            priorityPhase:      data.priorityPhase       || "",
            skipOpportunity:    data.skipOpportunity     || null,
            groqPowered:        true,
        };
    } catch (e) {
        console.warn("groqRoadmapInsights failed:", e.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// 8. ROADMAP PHASE COACH — per-phase AI coaching tip
// Called on-demand when user expands a phase
// ═══════════════════════════════════════════════════════════
export async function groqRoadmapPhaseCoach({ role, phaseName, skills, knownLanguages, learningStyle }) {
    const system = `You are a senior developer and coding mentor. Give concise, specific, expert coaching for a learner working on this phase of their roadmap.
Return ONLY valid JSON — no markdown, no backticks.`;

    const relevantKnown = knownLanguages.filter(lang =>
        lang.toLowerCase() !== "none" && lang.toLowerCase() !== "none - i'm starting fresh"
    );

    const prompt = `Learner targeting: ${role}
Current Phase: "${phaseName}"
Skills in this phase: ${skills.join(", ")}
Prior knowledge: ${relevantKnown.length ? relevantKnown.join(", ") : "None"}
Learning style: ${learningStyle || "Not specified"}

Return ONLY this JSON:
{
  "coachTip": "One specific, expert coaching tip for THIS exact phase — reference actual skill names from the list",
  "commonMistake": "The #1 mistake learners make in this phase and how to avoid it — be specific",
  "quickWin": "A small exercise or mini-project doable in 1-2 days that will solidify this phase's core concept",
  "resourceSpotlight": "One specific resource name (course, book, or site) and exactly what to focus on in it for this phase"
}`;

    try {
        const raw  = await callGroq(system, prompt, 600);
        const data = parseJSON(raw);
        return {
            coachTip:          data.coachTip          || "",
            commonMistake:     data.commonMistake     || "",
            quickWin:          data.quickWin           || "",
            resourceSpotlight: data.resourceSpotlight || "",
            groqPowered:       true,
        };
    } catch (e) {
        console.warn("groqRoadmapPhaseCoach failed:", e.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// 9. INTERVIEW ANSWER EVALUATION — Groq-powered feedback
// ═══════════════════════════════════════════════════════════
export async function groqEvaluateAnswer(question, role, answer) {
    const system = `You are a senior technical interviewer with 15+ years of experience hiring ${role}s.
Evaluate interview answers honestly and constructively. Return ONLY valid JSON — no markdown, no backticks, no extra text.`;

    const prompt = `Interview Question: "${question}"
Role Applied For: ${role}
Candidate's Answer: "${answer.substring(0, 1500)}"

Evaluate this answer thoroughly. Return ONLY this exact JSON:
{
  "score": <0-100 overall quality score>,
  "verdict": "Excellent|Good|Needs Work|Poor",
  "strengths": ["specific strength drawn from their actual answer", "another specific strength"],
  "gaps": ["specific missing concept or gap in their answer", "another gap"],
  "improvements": ["concrete actionable improvement tip 1", "concrete tip 2"],
  "modelAnswer": "A concise 3-4 sentence ideal answer covering the key points a strong candidate would mention",
  "keywordsUsed": ["technical keyword actually found in their answer"],
  "keywordsMissed": ["important keyword they should have mentioned for this question"]
}

Scoring guide:
- 90-100: Exceptional — covers all key concepts with examples and depth
- 70-89: Good — covers main points, may lack one area or concrete examples
- 50-69: Adequate — touches the topic but missing key concepts or too vague
- Below 50: Incomplete or inaccurate answer

Rules:
- Be specific to THIS answer — reference what they actually wrote
- keywordsUsed: only list terms genuinely present in their answer (max 6)
- keywordsMissed: the most important missing technical terms (max 6)
- strengths / gaps: max 3 each, be direct`;

    try {
        const raw  = await callGroq(system, prompt, 1200);
        const data = parseJSON(raw);
        return {
            score:          Math.min(100, Math.max(0, data.score || 0)),
            verdict:        data.verdict        || "Needs Work",
            strengths:      Array.isArray(data.strengths)     ? data.strengths     : [],
            gaps:           Array.isArray(data.gaps)          ? data.gaps          : [],
            improvements:   Array.isArray(data.improvements)  ? data.improvements  : [],
            modelAnswer:    data.modelAnswer    || "",
            keywordsUsed:   Array.isArray(data.keywordsUsed)  ? data.keywordsUsed  : [],
            keywordsMissed: Array.isArray(data.keywordsMissed)? data.keywordsMissed: [],
            groqPowered:    true,
        };
    } catch (e) {
        console.warn("groqEvaluateAnswer failed:", e.message);
        return null;
    }
}
// ═══════════════════════════════════════════════════════════
// 10. CAREER INSIGHTS AI ANALYSIS — no resume needed
// Called from /api/career/insights with role+experience+location+skills
// ═══════════════════════════════════════════════════════════
export async function groqCareerInsights({ role, experienceYears, location, skills, salaryData, topSkills, bertSkillGap }) {
    const system = `You are an expert career counsellor and technical recruiter with 15+ years of India tech market experience.
Given a candidate's profile, generate precise, actionable, India-specific career insights.
Return ONLY valid JSON — no markdown, no backticks, no extra text.`;

    const userSkillsList = skills.length ? skills.join(', ') : 'Not specified';
    const bertSection = bertSkillGap
        ? `\nBERT Semantic Skill Gap:\n- Already matched: ${(bertSkillGap.matched || []).join(', ') || 'none'}\n- Partial match: ${(bertSkillGap.partial || []).join(', ') || 'none'}\n- Missing skills: ${(bertSkillGap.missing || []).slice(0, 8).join(', ') || 'none'}`
        : '';

    const prompt = `Candidate Profile:
- Target Role: ${role}
- Experience: ${experienceYears} years
- Location: ${location}
- User Skills: ${userSkillsList}
- Market Avg Salary: ₹${Math.round((salaryData.average || 0) / 100000)}L – Max: ₹${Math.round((salaryData.maximum || 0) / 100000)}L
- Top in-demand skills for this role: ${topSkills.slice(0, 8).map(s => s.name).join(', ')}${bertSection}

Return ONLY this exact JSON (no markdown, no preamble):
{
  "headline": "One punchy sentence (max 12 words) about this candidate's current market position",
  "marketSummary": "2-3 sentences: honest assessment of this person's position in the ${location} market for ${role} — reference their actual experience and skills",
  "salaryVerdict": "One sentence on whether their profile justifies top, mid, or entry salary — be specific",
  "readinessScore": <0-100 — how ready they are to apply RIGHT NOW>,
  "readinessLabel": "Not Ready|Getting There|Ready|Highly Competitive",
  "topPrioritySkill": {
    "skill": "The single most impactful skill they should learn next",
    "reason": "Why this skill specifically — reference their current skill set",
    "estimatedWeeks": <realistic weeks to learn>
  },
  "competitiveEdge": "One specific advantage this person has over other candidates in ${location}",
  "biggestGap": "One honest sentence about their most critical weakness for this role",
  "weekOneAction": "The single most impactful concrete action in the next 7 days — be specific",
  "locationInsight": "One ${location}-specific insight about the ${role} job market",
  "careerTrajectory": "One sentence on their realistic next career step in 12-18 months",
  "hiddenOpportunity": "One non-obvious adjacent role or domain their current skills also suit well"
}

Rules:
- readinessScore: be honest — fresh grad = 20-40, 3 yrs exp with skills = 60-75, strong profile = 80+
- All text must reference actual profile data — zero generic advice
- salaryVerdict: mention actual numbers from the salary data provided`;

    try {
        const raw  = await callGroq(system, prompt, 1500);
        const data = parseJSON(raw);
        return {
            headline:           data.headline           || '',
            marketSummary:      data.marketSummary      || '',
            salaryVerdict:      data.salaryVerdict      || '',
            readinessScore:     Math.min(100, Math.max(0, data.readinessScore || 0)),
            readinessLabel:     data.readinessLabel     || 'Getting There',
            topPrioritySkill:   data.topPrioritySkill   || null,
            competitiveEdge:    data.competitiveEdge    || '',
            biggestGap:         data.biggestGap         || '',
            weekOneAction:      data.weekOneAction       || '',
            locationInsight:    data.locationInsight    || '',
            careerTrajectory:   data.careerTrajectory   || '',
            hiddenOpportunity:  data.hiddenOpportunity  || '',
            groqPowered:        true,
        };
    } catch (e) {
        console.warn('groqCareerInsights failed:', e.message);
        return null;
    }
}