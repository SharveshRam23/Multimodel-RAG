import os
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import whisper
import logging

logging.basicConfig(level=logging.INFO)

whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        logging.info("Loading Whisper model (small)...")
        whisper_model = whisper.load_model("small")
    return whisper_model

def load_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text() + "\n\n"
        doc.close()
    except Exception as e:
        return f"Error reading PDF: {e}"
    return text

def load_image(file_path: str) -> str:
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return f"Error reading Image: {e}"

def load_audio(file_path: str) -> str:
    try:
        model = get_whisper_model()
        result = model.transcribe(file_path)
        return result["text"].strip()
    except Exception as e:
        return f"Error reading Audio: {e}"
