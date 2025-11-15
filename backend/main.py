import os, json, tempfile, shutil
from pathlib import Path
from typing import List, Dict, Any

import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from pytesseract import Output
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import motor.motor_asyncio
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI(title="Smart Notes OCR Backend")

# ----------------------------
# CORS (For Next.js Frontend)
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# MongoDB (Optional)
# ----------------------------
mongo_uri = os.getenv("MONGODB_URI")
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri) if mongo_uri else None

# ----------------------------
# Embedding Model (Lazy Load)
# ----------------------------
embedding_model = None
def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        except:
            embedding_model = False
    return embedding_model if embedding_model else None

# ----------------------------
# OCR From Image
# ----------------------------
def extract_text_from_image(image_path: str) -> Dict[str, Any]:
    try:
        img = Image.open(image_path).convert("L")  # grayscale
        data = pytesseract.image_to_data(img, output_type=Output.DICT)
        text = pytesseract.image_to_string(img)

        confidences = [int(c) for c in data["conf"] if c.isdigit() and int(c) > 0]
        avg_conf = sum(confidences) / len(confidences) if confidences else 0

        return {
            "text": text.strip(),
            "confidence": avg_conf,
            "word_count": len(text.split()),
            "character_count": len(text)
        }

    except Exception as e:
        raise HTTPException(500, f"OCR failed: {e}")

# ----------------------------
# OCR From PDF
# ----------------------------
def extract_text_from_pdf(pdf_path: str) -> Dict[str, Any]:
    try:
        doc = fitz.open(pdf_path)
        all_text = []

        with tempfile.TemporaryDirectory() as tmp:
            for i, page in enumerate(doc):
                text = page.get_text()

                if len(text.strip()) > 50:
                    all_text.append(text)
                else:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_path = f"{tmp}/p{i}.png"
                    pix.save(img_path)

                    ocr = extract_text_from_image(img_path)
                    all_text.append(ocr["text"])

        full_text = "\n\n--- PAGE BREAK ---\n\n".join(all_text)

        return {
            "text": full_text,
            "page_count": len(doc),
            "pages": all_text,
            "word_count": len(full_text.split()),
            "character_count": len(full_text)
        }

    except Exception as e:
        raise HTTPException(500, f"PDF processing failed: {e}")

# ----------------------------
# Generate Embeddings
# ----------------------------
def generate_embeddings(text: str) -> List[float]:
    model = get_embedding_model()
    if not model:
        # fallback simple vector
        vec = [0.0] * 384
        words = text.lower().split()[:100]
        for w in words:
            vec[hash(w) % 384] += 1.0 / len(words)
        return vec

    return model.encode(text).tolist()

# ----------------------------
# API ROUTES
# ----------------------------
@app.get("/")
async def root():
    return {"message": "OCR Backend Running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "tesseract": "yes" if shutil.which("tesseract") else "no",
        "mongodb": "connected" if mongo_client else "not configured"
    }

@app.post("/extract-ocr")
async def extract_ocr(
    file: UploadFile = File(...),
    file_id: str = Form(None),
    labels: str = Form(None),
):
    if not file.filename:
        raise HTTPException(400, "No file uploaded")

    with tempfile.TemporaryDirectory() as tmp:
        file_path = f"{tmp}/{file.filename}"
        content = await file.read()

        with open(file_path, "wb") as f:
            f.write(content)

        ext = Path(file.filename).suffix.lower()

        if ext == ".pdf":
            result = extract_text_from_pdf(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            result = extract_text_from_image(file_path)
        else:
            raise HTTPException(400, f"Unsupported type: {ext}")

        embeddings = generate_embeddings(result["text"])
        parsed_labels = json.loads(labels) if labels else {}

        if file_id and mongo_client:
            try:
                db = mongo_client.smartnotes.files
                await db.update_one(
                    {"_id": ObjectId(file_id)},
                    {"$set": {
                        "ocrText": result["text"],
                        "embeddings": embeddings,
                        "metadata": {
                            "pageCount": result.get("page_count"),
                            "wordCount": result["word_count"],
                            "characterCount": result["character_count"]
                        }
                    }}
                )
            except Exception as e:
                print("MongoDB update failed:", e)

        return {
    "success": True,
    "fileId": file_id,   # <-- FIXED (camelCase)
    "text": result["text"],
    "embeddings": embeddings,
    "metadata": result,
    "labels": parsed_labels
}



@app.post("/generate-embeddings")
async def embedding_api(text: str = Form(...)):
    return {
        "success": True,
        "embeddings": generate_embeddings(text)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
