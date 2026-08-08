@echo off
title La Marquise - Activer super_admin
cd /d "%~dp0backend"

if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe promote_admin.py
) else (
    python promote_admin.py
)

echo.
pause
