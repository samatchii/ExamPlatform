@echo off
title ExamPlatform - Lanceur Automatique
color 0A

echo.
echo ========================================
echo    EXAMPLATFORM - DEMARRAGE AUTO
echo ========================================
echo.

REM Verification MongoDB
echo [1/4] Verification de MongoDB...
netstat -ano | findstr :27017 > nul
if %errorlevel% equ 0 (
    echo    [OK] MongoDB est demarre
) else (
    echo    [ERREUR] MongoDB n'est pas demarre !
    echo.
    echo    Veuillez demarrer MongoDB d'abord :
    echo    - Service Windows: net start MongoDB
    echo    - Ou manuellement: mongod
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Demarrage du Backend Spring Boot...
echo    Port: 8080
echo    URL: http://localhost:8080/api
echo.
start "Backend Spring Boot" cmd /c "cd backend-spring && echo Demarrage du backend... && mvn spring-boot:run"

echo    Attente de 15 secondes pour que le backend demarre...
timeout /t 15 /nobreak > nul

echo.
echo [3/4] Demarrage du Frontend React...
echo    Port: 3000
echo    URL: http://localhost:3000
echo.
start "Frontend React" cmd /c "echo Demarrage du frontend... && npm start"

echo    Attente de 10 secondes pour que le frontend demarre...
timeout /t 10 /nobreak > nul

echo.
echo [4/4] Ouverture du navigateur...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================
echo    PROJET DEMARRE AVEC SUCCES !
echo ========================================
echo.
echo    URLs actives :
echo    - Frontend : http://localhost:3000
echo    - Backend  : http://localhost:8080/api
echo    - MongoDB  : mongodb://localhost:27017/dbpfa
echo.
echo    IMPORTANT : 
echo    - NE FERMEZ PAS cette fenetre
echo    - 2 fenetres CMD sont ouvertes (Backend + Frontend)
echo    - Pour arreter : Fermez les 2 fenetres CMD
echo.
echo ========================================
echo.

pause
