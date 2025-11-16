import fitz
from PIL import Image
import pytesseract
from fastapi import FastAPI, UploadFile, File
import io

app = FastAPI()

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    pdf = fitz.open(stream=await file.read(), filetype="pdf")
    full_text = ""

    for page in pdf:
        text = page.get_text()
        if text.strip():
            full_text += text + "\n"
            continue

        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_string(img)
        full_text += text + "\n"

    return {"text": full_text}
