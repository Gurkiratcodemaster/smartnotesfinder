@echo off
echo Starting Smart Notes Python Backend...

cd backend

if not exist "venv" (
    echo Virtual environment not found. Running setup...
    call setup.bat
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting server on http://localhost:8000...
python main.py