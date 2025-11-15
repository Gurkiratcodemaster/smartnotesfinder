# Start Smart Notes Backend Server
Set-Location "C:\Users\gurkirat-singh\Documents\smartnotesfinder\backend"

Write-Host "Activating virtual environment..."
& "venv\Scripts\Activate.ps1"

Write-Host "Starting Python backend server..."
& py main.py