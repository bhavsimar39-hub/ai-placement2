import json

def get_skill_gap(text):
    text = text.lower()

    with open("datasets/skill_dataset.json", "r") as f:
        all_skills = json.load(f)

    with open("datasets/job_roles.json", "r") as f:
        roles = json.load(f)

    user_skills = [skill for skill in all_skills if skill in text]

    gaps = {}
    for role, required in roles.items():
        missing = [skill for skill in required if skill not in user_skills]
        gaps[role] = missing

    return {
        "user_skills": user_skills,
        "gaps": gaps
    }
