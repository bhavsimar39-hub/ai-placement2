import json
import os

# Load job roles JSON file
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "job_roles.json")

def load_job_roles():
    with open(DATA_PATH, "r") as file:
        return json.load(file)

def match_job(text):
    """
    Simple job matching based on keyword scanning.
    Returns the job role with highest keyword matches.
    """
    job_roles = load_job_roles()
    text_lower = text.lower()

    best_role = None
    best_score = 0

    for role, keywords in job_roles.items():
        score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
        if score > best_score:
            best_score = score
            best_role = role

    return best_role or "No matching job found"
