export const jobMatch = (skills, roles) => {
    return roles.map(role => {
        const matchCount = role.requiredSkills.filter(s => skills.includes(s)).length;
        const score = Math.round((matchCount / role.requiredSkills.length) * 100);

        return {
            role: role.title,
            score
        };
    });
};
