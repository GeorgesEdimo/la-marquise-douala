@echo off
title La Marquise - Initialisation Base de Donnees
cd /d "%~dp0backend"

echo ============================================
echo   La Marquise - Initialisation BDD
echo ============================================
echo.

if exist ".venv\Scripts\python.exe" (
    set PYTHON=.venv\Scripts\python.exe
) else (
    set PYTHON=python
)

echo [1/3] Verification du venv Python...
if exist ".venv\Scripts\python.exe" (
    echo   OK - venv trouve
) else (
    echo   Creation du venv...
    python -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
)
echo.

echo [2/3] Installation des dependances...
%PYTHON% -m pip install -r requirements.txt --quiet
echo.

echo [3/3] Creation des tables + seed admin + menu...
%PYTHON% -m app.seed
echo.

echo ============================================
echo   Base de donnees initialisee !
echo   Fichier : backend\lamarquise.db
echo   Admin   : admin@lamarquise-douala.com
echo   Password: LaMarquise2026!
echo.
echo   Lance maintenant : start_backend.bat
echo ============================================
pause
