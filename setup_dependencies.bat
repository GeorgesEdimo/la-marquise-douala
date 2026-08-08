@echo off
title La Marquise - Installation des dependances
cd /d "%~dp0"

echo ============================================
echo   La Marquise - Installation des dependances
echo ============================================
echo.

echo [1/3] Installation des dependances BACKEND...
cd backend
if exist ".venv\Scripts\python.exe" (
    echo   (utilise le venv existant)
    .venv\Scripts\pip install -r requirements.txt
) else (
    echo   Creation du venv...
    python -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
)
echo.

echo [2/3] Initialisation de la base de donnees...
.venv\Scripts\python.exe -m app.seed
echo.

echo [3/3] Installation des dependances FRONTEND...
cd ..
call npm install
echo.

echo ============================================
echo   Installation terminee !
echo   Lance maintenant : start_all.bat
echo ============================================
pause
