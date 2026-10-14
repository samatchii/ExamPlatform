# ExamPlatform - Script de lancement automatique
# PowerShell Version

$Host.UI.RawUI.WindowTitle = "ExamPlatform - Lanceur"
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "Green"
Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   EXAMPLATFORM - DEMARRAGE AUTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier si un port est utilisé
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# 1. Vérifier MongoDB
Write-Host "[1/4] Verification de MongoDB..." -ForegroundColor Yellow
if (Test-Port -Port 27017) {
    Write-Host "   [OK] MongoDB est demarre (port 27017)" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] MongoDB n'est pas demarre !" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Veuillez demarrer MongoDB d'abord :" -ForegroundColor Yellow
    Write-Host "   - Service Windows: net start MongoDB" -ForegroundColor White
    Write-Host "   - Ou manuellement: mongod" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""

# 2. Démarrer le Backend Spring Boot
Write-Host "[2/4] Demarrage du Backend Spring Boot..." -ForegroundColor Yellow

if (Test-Port -Port 8080) {
    Write-Host "   [INFO] Backend deja demarre (port 8080)" -ForegroundColor Cyan
} else {
    Write-Host "   Port: 8080" -ForegroundColor White
    Write-Host "   URL: http://localhost:8080/api" -ForegroundColor White
    Write-Host ""
    
    $backendPath = Join-Path $PSScriptRoot "backend-spring"
    Start-Process cmd -ArgumentList "/k", "cd /d `"$backendPath`" && echo Demarrage du Backend Spring Boot... && mvn spring-boot:run" -WindowStyle Normal
    
    Write-Host "   Attente de 20 secondes pour le demarrage..." -ForegroundColor Gray
    Start-Sleep -Seconds 20
    
    if (Test-Port -Port 8080) {
        Write-Host "   [OK] Backend demarre avec succes" -ForegroundColor Green
    } else {
        Write-Host "   [AVERTISSEMENT] Le backend prend plus de temps..." -ForegroundColor Yellow
        Write-Host "   Continuez quand meme..." -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. Démarrer le Frontend React
Write-Host "[3/4] Demarrage du Frontend React..." -ForegroundColor Yellow

if (Test-Port -Port 3000) {
    Write-Host "   [INFO] Frontend deja demarre (port 3000)" -ForegroundColor Cyan
} else {
    Write-Host "   Port: 3000" -ForegroundColor White
    Write-Host "   URL: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    Start-Process cmd -ArgumentList "/k", "cd /d `"$PSScriptRoot`" && echo Demarrage du Frontend React... && npm start" -WindowStyle Normal
    
    Write-Host "   Attente de 15 secondes pour le demarrage..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
}

Write-Host ""

# 4. Ouvrir le navigateur
Write-Host "[4/4] Ouverture du navigateur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PROJET DEMARRE AVEC SUCCES !" -ForegroundColor Cyan -BackgroundColor DarkGreen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   URLs actives :" -ForegroundColor White
Write-Host "   - Frontend : http://localhost:3000" -ForegroundColor Green
Write-Host "   - Backend  : http://localhost:8080/api" -ForegroundColor Green
Write-Host "   - MongoDB  : mongodb://localhost:27017/dbpfa" -ForegroundColor Green
Write-Host ""
Write-Host "   IMPORTANT :" -ForegroundColor Yellow
Write-Host "   - NE FERMEZ PAS cette fenetre" -ForegroundColor White
Write-Host "   - 2 fenetres CMD sont ouvertes (Backend + Frontend)" -ForegroundColor White
Write-Host "   - Pour arreter : Fermez les 2 fenetres CMD" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Appuyez sur Entree pour fermer ce lanceur"
