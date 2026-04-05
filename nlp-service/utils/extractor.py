import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_FILE = os.path.join(BASE_DIR, "datasets", "skill_dataset.json")

def extract_skills(text):
    with open(DATA_FILE, "r") as f:
        skills = json.load(f)

    extracted = []
    text_low = text.lower()

    for skill in skills:
        if skill.lower() in text_low:
            extracted.append(skill)

    return extracted
