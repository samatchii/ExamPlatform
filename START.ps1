Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ExamPlatform - Diagnostic & Demarrage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier MongoDB
Write-Host "[1/3] Verification MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "  [OK] MongoDB demarre sur port 27017" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] MongoDB n'est pas demarre !" -ForegroundColor Red
    Write-Host "  Demarrez MongoDB d'abord :" -ForegroundColor Yellow
    Write-Host "  - Service Windows: net start MongoDB" -ForegroundColor Yellow
    Write-Host "  - Ou manuellement: mongod" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

# 2. Vérifier Backend Spring Boot
Write-Host "[2/3] Verification Backend Spring Boot..." -ForegroundColor Yellow
$backendRunning = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "  [OK] Backend deja demarre sur port 8080" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Backend non demarre. Demarrage en cours..." -ForegroundColor Yellow
    Start-Process cmd -ArgumentList "/k", "cd backend-spring && mvn spring-boot:run" -WindowStyle Normal
    Write-Host "  [ATTENTE] Patientez 30 secondes pour que le backend demarre..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# 3. Vérifier Frontend React
Write-Host "[3/3] Verification Frontend React..." -ForegroundColor Yellow
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "  [OK] Frontend deja demarre sur port 3000" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Frontend non demarre. Demarrage en cours..." -ForegroundColor Yellow
    Start-Process cmd -ArgumentList "/k", "npm start" -WindowStyle Normal
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   URLs importantes :" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:8080/api" -ForegroundColor White
Write-Host "   - MongoDB:  mongodb://localhost:27017" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ouverture du navigateur dans 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "[OK] Projet lance avec succes !" -ForegroundColor Green
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
