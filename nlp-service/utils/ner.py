import json

def extract_skills(text):
    text = text.lower()

    with open("datasets/skill_dataset.json", "r") as f:
        skills = json.load(f)

    found = [skill for skill in skills if skill in text]

    return found
