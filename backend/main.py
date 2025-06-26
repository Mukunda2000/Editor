from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

resume_store = {}

class EnhanceRequest(BaseModel):
    section: str
    content: str

@app.post("/ai-enhance")
async def enhance_section(data: EnhanceRequest):
    section = data.section.lower()
    content = data.content.strip()

    # Simple mocked enhancements for each section type
    if section == "summary":
        enhanced = content + " Skilled in full-stack development with a passion for building scalable web applications."
    elif section in ["experience", "education", "projects"]:
        enhanced = content + " | Demonstrated strong problem-solving and teamwork skills."
    elif section == "skills":
        enhanced = content + " | Time Management"
    elif section == "certifications":
        enhanced = content + " | Google Cloud Certified"
    elif section == "hobbies":
        enhanced = content + " | Reading Tech Blogs"
    else:
        enhanced = content + " (enhanced)"

    return {"enhanced_content": enhanced}

@app.post("/save-resume")
async def save_resume(data: dict):
    resume_store["resume"] = data
    with open("resume_data.json", "w") as f:
        json.dump(data, f, indent=2)
    return {"status": "saved"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx"]:
        return {"error": "Only PDF or DOCX allowed."}
    content = await file.read()
    text = f"Fake parsed text from {file.filename}"
    return {"filename": file.filename, "content": text}

# @app.post("/upload-resume")
# async def upload_resume(file: UploadFile = File(...)):
#     ext = file.filename.split(".")[-1].lower()
#     if ext not in ["pdf", "docx"]:
#         return {"error": "Only PDF or DOCX allowed."}
#     # NOTE: Use real parser like PyMuPDF or python-docx here
#     text = f"Parsed text from: {file.filename}"
#     return {"filename": file.filename, "content": text}

