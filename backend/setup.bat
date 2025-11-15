@echo off
echo Setting up Smart Notes Python Backend...

echo.
echo [1/4] Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo.
echo [2/4] Creating virtual environment...
cd backend
python -m venv venv

echo.
echo [3/4] Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [4/4] Installation complete!
echo.
echo To start the backend server:
echo   cd backend
echo   call venv\Scripts\activate.bat
echo   python main.py
echo.
echo The backend will run on http://localhost:8000
echo Make sure to install Tesseract OCR separately if not already installed.
echo.
pause