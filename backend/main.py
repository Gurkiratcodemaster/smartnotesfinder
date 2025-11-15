import os
import sys
from pathlib import Path
import tempfile
import shutil
import json
from typing import List, Dict, Any
import uuid

# PDF and image processing
import fitz  # PyMuPDF
from PIL import Image
import numpy as np

# OCR
import pytesseract
from pytesseract import Output

# Text embeddings (optional - lazy loaded)
# from sentence_transformers import SentenceTransformer

# FastAPI for REST API
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# MongoDB (optional)
from pymongo import MongoClient
from bson import ObjectId
import motor.motor_asyncio

# Environment variables
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart Notes OCR Backend", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Embedding model (lazy loaded to speed up startup)
embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading sentence transformer model...")
            embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Embedding model loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load embedding model: {e}")
            embedding_model = False  # Mark as failed
    return embedding_model if embedding_model is not False else None

# MongoDB connection (optional)
MONGODB_URI = os.getenv("MONGODB_URI")
mongo_client = None
if MONGODB_URI:
    try:
        mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
        print("✓ MongoDB connection established")
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB: {e}")

def extract_text_from_image(image_path: str) -> Dict[str, Any]:
    """Extract text from image using Tesseract OCR"""
    try:
        # Load image
        image = Image.open(image_path)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Enhance image for better OCR
        image = image.convert('L')  # Convert to grayscale
        
        # Extract text with confidence scores
        data = pytesseract.image_to_data(image, output_type=Output.DICT)
        
        # Extract text
        text = pytesseract.image_to_string(image)
        
        # Calculate average confidence
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "text": text.strip(),
            "confidence": avg_confidence,
            "word_count": len(text.split()),
            "character_count": len(text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

def extract_text_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """Extract text from PDF using PyMuPDF"""
    try:
        doc = fitz.open(pdf_path)
        all_text = []
        page_texts = []
        
        with tempfile.TemporaryDirectory() as temp_dir:
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # First try to extract text directly (for text PDFs)
                direct_text = page.get_text()
                
                if len(direct_text.strip()) > 50:  # Sufficient text found
                    page_texts.append(direct_text)
                    all_text.append(direct_text)
                else:
                    # Convert page to image for OCR (for scanned PDFs)
                    pix = page.get_pixmap(
                        matrix=fitz.Matrix(2, 2),
                        alpha=False
                    )
                    img_path = os.path.join(temp_dir, f"page_{page_num}.png")
                    pix.save(img_path)
                    
                    # Extract text with OCR
                    ocr_result = extract_text_from_image(img_path)
                    page_text = ocr_result["text"]
                    page_texts.append(page_text)
                    all_text.append(page_text)
        
        doc.close()
        
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(all_text)
        
        return {
            "text": full_text,
            "page_count": len(doc),
            "pages": page_texts,
            "word_count": len(full_text.split()),
            "character_count": len(full_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")

def generate_embeddings(text: str) -> List[float]:
    """Generate text embeddings using sentence-transformers"""
    model = get_embedding_model()
    if not model:
        # Fallback to simple hash-based embeddings
        words = text.lower().split()[:100]  # Limit words for performance
        embedding = [0.0] * 384
        for i, word in enumerate(words):
            hash_val = hash(word) % 384
            embedding[hash_val] += 1.0 / (len(words) + 1)
        return embedding
    
    try:
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding generation failed: {e}")
        return [0.0] * 384

@app.get("/")
async def root():
    return {"message": "Smart Notes OCR Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "tesseract": "available" if shutil.which("tesseract") else "not found",
        "embedding_model": "loaded" if embedding_model else "not available",
        "mongodb": "connected" if mongo_client else "not connected"
    }

@app.post("/extract-ocr")
async def extract_ocr(
    file: UploadFile = File(...),
    file_id: str = Form(None),
    labels: str = Form(None)
):
    """Extract text from uploaded file using OCR"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Create temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        # Save uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        
        try:
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Determine file type and process accordingly
            file_ext = Path(file.filename).suffix.lower()
            
            if file_ext == '.pdf':
                result = extract_text_from_pdf(file_path)
            elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                result = extract_text_from_image(file_path)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}")
            
            # Generate embeddings
            embeddings = generate_embeddings(result["text"])
            
            # Parse labels if provided
            parsed_labels = {}
            if labels:
                try:
                    parsed_labels = json.loads(labels)
                except json.JSONDecodeError:
                    print(f"Warning: Could not parse labels: {labels}")
            
            # Update MongoDB if file_id provided and MongoDB is available
            if file_id and mongo_client:
                try:
                    db = mongo_client.smartnotes
                    files_collection = db.files
                    
                    await files_collection.update_one(
                        {"_id": ObjectId(file_id)},
                        {
                            "$set": {
                                "ocrText": result["text"],
                                "embeddings": embeddings,
                                "metadata.pageCount": result.get("page_count", 1),
                                "metadata.extractedAt": "$$NOW",
                                "metadata.wordCount": result["word_count"],
                                "metadata.characterCount": result["character_count"]
                            }
                        }
                    )
                except Exception as db_error:
                    print(f"MongoDB update failed: {db_error}")
            
            return {
                "success": True,
                "file_id": file_id,
                "extracted_text": result["text"],
                "embeddings": embeddings,
                "metadata": {
                    "page_count": result.get("page_count", 1),
                    "word_count": result["word_count"],
                    "character_count": result["character_count"],
                    "confidence": result.get("confidence"),
                },
                "labels": parsed_labels
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/generate-embeddings")
async def generate_text_embeddings(text: str = Form(...)):
    """Generate embeddings for provided text"""
    try:
        embeddings = generate_embeddings(text)
        return {
            "success": True,
            "embeddings": embeddings,
            "dimension": len(embeddings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)