@echo off
title Backend Spring Boot
color 0A

echo.
echo ========================================
echo    DEMARRAGE DU BACKEND SPRING BOOT
echo ========================================
echo.

cd backend-spring

echo [INFO] Verification de Java...
java -version
if %errorlevel% neq 0 (
    echo [ERREUR] Java n'est pas installe ou pas dans le PATH !
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Demarrage du backend sur le port 8080...
echo [INFO] Cela peut prendre 1-2 minutes la premiere fois...
echo.
echo [CONSEIL] Attendez le message "Started ExamPlatformApplication"
echo.

mvn spring-boot:run

pause
