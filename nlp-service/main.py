from fastapi import FastAPI
from pydantic import BaseModel
from utils.extractor import extract_skills
from utils.job_matcher import match_job
from utils.readiness_algo import calculate_readiness

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "NLP Service Running Successfully!"}

@app.post("/analyze")
def analyze(data: TextRequest):
    text = data.text

    # Extract skills
    skills = extract_skills(text)

    # Match job
    job_role = match_job(text)

    # Readiness score
    readiness = calculate_readiness(skills)

    return {
        "skills": skills,
        "matched_job": job_role,
        "readiness_score": readiness
    }

# 🚀 IMPORTANT: RUN SERVER
if __name__ == "__main__":
    import uvicorn
    print("🚀 NLP Service Started on port 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
