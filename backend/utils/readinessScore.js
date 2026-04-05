export const readinessScore = ({ skillMatch, resumeQuality, cgpa, projects }) => {
    return (
        skillMatch * 0.4 +
        resumeQuality * 0.3 +
        cgpa * 0.2 +
        projects * 0.1
    );
};
