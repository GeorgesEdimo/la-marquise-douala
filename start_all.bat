@echo off
echo ============================================
echo   La Marquise - Demarrage complet
echo ============================================
echo.
echo 1. Lancement du backend (fenetre separee)...
start "La Marquise - Backend" cmd /c "cd /d %~dp0 && start_backend.bat"
echo.
timeout /t 3 /nobreak >nul
echo 2. Lancement du frontend (fenetre separee)...
start "La Marquise - Frontend" cmd /c "cd /d %~dp0 && start_frontend.bat"
echo.
echo ============================================
echo   Les deux serveurs demarrent !
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:5173
echo   Dashboard: http://localhost:5173/admin/login
echo ============================================
echo.
echo Ne fermez PAS cette fenetre tant que vous utilisez l'app.
pause
