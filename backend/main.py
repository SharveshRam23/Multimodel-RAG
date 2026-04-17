from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import uuid
import uuid

import loaders
import rag
import agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    file_loc = f"uploads/{file.filename}"
    
    with open(file_loc, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    ext = file.filename.split(".")[-1].lower()
    text = ""
    doc_type = "unknown"
    
    if ext in ["pdf"]:
        text = loaders.load_pdf(file_loc)
        doc_type = "pdf"
    elif ext in ["png", "jpg", "jpeg", "webp"]:
        text = loaders.load_image(file_loc)
        doc_type = "image"
    elif ext in ["mp3", "wav", "ogg", "m4a"]:
        text = loaders.load_audio(file_loc)
        doc_type = "audio"
    elif ext in ["txt", "md"]:
        with open(file_loc, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        doc_type = "text"
        
    rag.store_document(doc_id, file.filename, doc_type, text, summary=f"Imported {doc_type}")
    
    return {"message": "Upload successful", "doc_id": doc_id, "type": doc_type, "length": len(text)}

@app.get("/documents")
def list_documents():
    return {"documents": rag.get_all_documents()}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    result = agent.run_agent_loop(req.message)
    return result
