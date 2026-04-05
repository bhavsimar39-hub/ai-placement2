def calculate_readiness(skills):
    """
    Calculates readiness score based on number of matched skills.
    skills: list of extracted skills
    """
    if not skills:
        return 0

    total_skills = 20  # Assume total expected skills
    readiness = (len(skills) / total_skills) * 100

    return round(readiness, 2)
