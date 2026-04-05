export const calculateATS = (skills) => {
    return Math.min(100, skills.length * 5);
};
