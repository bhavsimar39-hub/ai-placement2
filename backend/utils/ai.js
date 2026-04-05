// utils/ai.js

// SAMPLE SKILL DATABASE (you can expand)
const SKILL_DATABASE = [
  "Java", "JavaScript", "Python", "C++", "HTML", "CSS",
  "React", "Node.js", "MongoDB", "SQL", "Spring Boot",
  "Machine Learning", "Deep Learning", "Data Structures",
  "Communication", "Leadership", "Teamwork"
];

// 1️⃣ Extract Skills From Resume Text --------------------------
export function extractSkills(text) {
  const lower = text.toLowerCase();

  return SKILL_DATABASE.filter(skill =>
    lower.includes(skill.toLowerCase())
  );
}

// 2️⃣ ATS Score (0–100) -----------------------------------------
export function calculateATSScore(text) {
  let score = 0;

  // resume length score
  if (text.length > 300) score += 30;
  else if (text.length > 150) score += 15;

  // keyword match score
  const foundSkills = extractSkills(text);
  score += foundSkills.length * 5;

  // grammar/clarity scoring (very basic)
  if (text.includes(".")) score += 10;

  if (score > 100) score = 100;
  return score;
}

// 3️⃣ Skill Gap Analysis -----------------------------------------
export function findSkillGaps(resumeSkills, jobRoleSkills) {
  return jobRoleSkills.filter(skill => !resumeSkills.includes(skill));
}

// 4️⃣ Match Score -------------------------------------------------
export function calculateMatchScore(resumeSkills, jobSkills) {
  const matched = resumeSkills.filter(s => jobSkills.includes(s));
  
  const score = Math.round((matched.length / jobSkills.length) * 100);
  return score;
}

// 5️⃣ Readiness Score ---------------------------------------------
export function readinessScore(ats, match) {
  return Math.round((ats * 0.6) + (match * 0.4));
}
