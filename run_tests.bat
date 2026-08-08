@echo off
title La Marquise - Tests d'integration
cd /d "%~dp0backend"

echo ============================================
echo   La Marquise - Tests d'integration API
echo ============================================
echo.
echo Le script verifie lui-meme que le backend repond.
echo Si le backend ne tourne pas, lance d'abord start_backend.bat.
echo.

if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe test_integration.py
) else (
    python test_integration.py
)

echo.
pause
