const jobSkills = ["Java", "Python", "React", "SQL", "Node.js"];

export const skillGap = (userSkills) => {
    const missing = jobSkills.filter(s => !userSkills.includes(s));
    return { missingSkills: missing };
};
