@echo off
title La Marquise - Demarrage complet
cd /d "%~dp0"

echo ============================================
echo   La Marquise - Demarrage complet
echo ============================================
echo.

REM ── 1. Venv Python ──
echo [1/4] Verification du venv Python...
if exist "backend\.venv\Scripts\python.exe" (
    backend\.venv\Scripts\python.exe -c "import uvicorn" >nul 2>&1
    if errorlevel 1 (
        echo   Venv corrompu - Recreation...
        rmdir /s /q backend\.venv
        python -m venv backend\.venv
        backend\.venv\Scripts\pip install -r backend\requirements.txt
    ) else (
        echo   OK
    )
) else (
    echo   Creation du venv...
    python -m venv backend\.venv
    backend\.venv\Scripts\pip install -r backend\requirements.txt
)
echo.

REM ── 2. Seed / Base de donnees ──
echo [2/4] Verification de la base de donnees...
if not exist "backend\lamarquise.db" (
    echo   Base absente - creation + seed...
    backend\.venv\Scripts\python.exe -m app.seed
) else (
    echo   Base existante OK
)
echo.

REM ── 3. Backend ──
echo [3/4] Demarrage backend (uvicorn)...
start "La Marquise - Backend" cmd /k "cd /d %~dp0backend && ..\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo   En attente du demarrage...
timeout /t 6 /nobreak >nul
echo.

REM ── 4. Frontend ──
echo [4/4] Demarrage frontend (vite)...
start "La Marquise - Frontend" cmd /k "cd /d %~dp0 && npm run dev"
echo.

echo ============================================
echo   Serveurs en cours de demarrage...
echo.
echo   Backend  : http://localhost:8000
echo   Docs API : http://localhost:8000/docs
echo   Frontend : http://localhost:5173
echo   Dashboard: http://localhost:5173/admin/login
echo.
echo   Login : admin@lamarquise-douala.com
echo   Pass  : LaMarquise2026!
echo ============================================
echo.
timeout /t 4 /nobreak >nul
start http://localhost:5173
pause
