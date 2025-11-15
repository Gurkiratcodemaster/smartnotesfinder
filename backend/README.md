# Smart Notes OCR Backend

A Python FastAPI backend for OCR text extraction and embedding generation.

## Features

- **OCR Processing**: Extract text from PDFs and images using Tesseract
- **Smart Text Extraction**: Handles both text-based and scanned PDFs
- **Text Embeddings**: Generate semantic embeddings using sentence-transformers
- **MongoDB Integration**: Optional database storage for processed files
- **REST API**: FastAPI endpoints for integration with frontend

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and add to PATH
3. Or set TESSERACT_CMD in .env file

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
BACKEND_PORT=8000
MONGODB_URI=mongodb://localhost:27017/smartnotes
TESSERACT_CMD=/usr/bin/tesseract  # Optional, will auto-detect
```

### 4. Run the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Extract OCR
```
POST /extract-ocr
Content-Type: multipart/form-data

file: <PDF or image file>
file_id: <optional MongoDB document ID>
labels: <optional JSON string with metadata>
```

### Generate Embeddings
```
POST /generate-embeddings
Content-Type: application/x-www-form-urlencoded

text: <text to generate embeddings for>
```

## Integration with Frontend

Update your Next.js API routes to call this Python backend:

```typescript
// In your Next.js API route
const formData = new FormData();
formData.append('file', file);
formData.append('file_id', fileId);
formData.append('labels', JSON.stringify(labels));

const response = await fetch('http://localhost:8000/extract-ocr', {
  method: 'POST',
  body: formData,
});
```

## Performance Notes

- First run downloads the embedding model (~90MB)
- Subsequent runs are much faster
- For production, consider using GPU acceleration
- Adjust image resolution in `extract_text_from_pdf()` for quality vs speed

## Dependencies

- **FastAPI**: Web framework
- **PyTesseract**: OCR engine
- **PyMuPDF**: PDF processing
- **Sentence-Transformers**: Text embeddings
- **Motor**: Async MongoDB driver