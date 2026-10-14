@echo off
title Test Backend Spring Boot
color 0E

echo.
echo ========================================
echo    TEST DU BACKEND SPRING BOOT
echo ========================================
echo.

echo [1/3] Test du port 8080...
netstat -ano | findstr :8080
if %errorlevel% equ 0 (
    echo    [OK] Le port 8080 est utilise
) else (
    echo    [ERREUR] Le port 8080 N'EST PAS utilise !
    echo    Le backend Spring Boot N'EST PAS demarre !
    echo.
    echo    Solution :
    echo    1. Ouvrez un nouveau terminal
    echo    2. cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring
    echo    3. mvn spring-boot:run
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Test de connexion HTTP...
curl -s http://localhost:8080/api/exams
if %errorlevel% equ 0 (
    echo.
    echo    [OK] Le backend repond correctement !
) else (
    echo    [ERREUR] Le backend ne repond pas aux requetes HTTP
)

echo.
echo [3/3] Ouverture dans le navigateur...
start http://localhost:8080/api/exams
timeout /t 2 >nul

echo.
echo ========================================
echo    Si vous voyez [] dans le navigateur,
echo    le backend fonctionne correctement !
echo ========================================
echo.

pause
