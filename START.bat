@echo off
echo ========================================
echo   ExamPlatform - Demarrage du projet
echo ========================================
echo.

echo [1/4] Verification de MongoDB...
echo Assurez-vous que MongoDB est demarré !
echo Si ce n'est pas le cas, ouvrez un autre terminal et lancez : mongod
echo.
timeout /t 3 >nul

echo [2/4] Demarrage du Backend Spring Boot...
start "ExamPlatform Backend" cmd /k "cd backend-spring && mvn spring-boot:run"
echo Backend demarre sur http://localhost:8080
echo.
timeout /t 5 >nul

echo [3/4] Demarrage du Frontend React...
start "ExamPlatform Frontend" cmd /k "npm start"
echo Frontend demarre sur http://localhost:3000
echo.

echo [4/4] Projet lance avec succes !
echo.
echo ========================================
echo   URLs importantes :
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8080/api
echo   - MongoDB:  mongodb://localhost:27017/dbpfa
echo ========================================
echo.
echo Appuyez sur une touche pour ouvrir le navigateur...
pause >nul

start http://localhost:3000

echo.
echo Pour arreter le projet, fermez les 2 fenetres de commande.
pause
