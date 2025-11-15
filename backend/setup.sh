#!/bin/bash
echo "Setting up Smart Notes Python Backend..."

echo
echo "[1/4] Checking Python installation..."
python3 --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from your package manager"
    exit 1
fi

echo
echo "[2/4] Creating virtual environment..."
cd backend
python3 -m venv venv

echo
echo "[3/4] Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo
echo "[4/4] Installation complete!"
echo
echo "To start the backend server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python main.py"
echo
echo "The backend will run on http://localhost:8000"
echo "Make sure to install Tesseract OCR if not already installed:"
echo "  macOS: brew install tesseract"
echo "  Ubuntu: sudo apt-get install tesseract-ocr"
echo