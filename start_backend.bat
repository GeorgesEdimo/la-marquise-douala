@echo off
title La Marquise - Backend API
cd /d "%~dp0backend"

echo ============================================
echo   La Marquise - Backend API (FastAPI)
echo   URL : http://localhost:8000/api/v1
echo   Docs : http://localhost:8000/docs
echo ============================================
echo.

REM ── Verifie que le venv fonctionne ──
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe -c "import uvicorn" >nul 2>&1
    if errorlevel 1 (
        echo   Venv corrompu - Recreation...
        rmdir /s /q .venv
        python -m venv .venv
        .venv\Scripts\pip install -r requirements.txt
    )
) else (
    echo   Creation du venv...
    python -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
)

REM ── Seed si base absente ──
if not exist "lamarquise.db" (
    echo   Creation de la base + seed...
    .venv\Scripts\python.exe -m app.seed
)

echo.
echo Lancement d'uvicorn... (Ctrl+C pour arreter)
echo.
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
