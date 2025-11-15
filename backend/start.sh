#!/bin/bash
echo "Starting Smart Notes Python Backend..."

cd backend

if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup.sh
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Starting server on http://localhost:8000..."
python main.py