@echo off
chcp 65001 > nul
echo ===================================================================
echo   Démarrage du déploiement conteneurisé Parking BCRG (Windows)
echo   Backend sur port 5002 | Frontend sur port 3002
echo ===================================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Docker Desktop n'est pas installé ou n'est pas dans le PATH !
    pause
    exit /b 1
)

if not exist .env (
    echo [INFO] Création du fichier .env racine depuis le modèle...
    copy .env.docker.example .env >nul
)

if not exist Backend\.env (
    echo [INFO] Création du fichier Backend\.env depuis le modèle...
    copy Backend\.env.example Backend\.env >nul
)

if not exist Frontend\.env (
    echo [INFO] Création du fichier Frontend\.env depuis le modèle...
    copy Frontend\.env.example Frontend\.env >nul
)

echo.
echo [1/4] Construction des images Docker (Backend & Frontend)...
docker compose build

echo.
echo [2/4] Démarrage des conteneurs (PostgreSQL, Backend API, Frontend Next.js)...
docker compose up -d

echo.
echo [3/4] Attente du démarrage de PostgreSQL et Backend...
timeout /t 6 /nobreak >nul

echo.
echo [4/4] Exécution automatique des migrations Prisma Next...
docker compose exec -T backend npx prisma db migrate

echo.
echo ===================================================================
echo [SUCCÈS] Déploiement terminé avec succès !
echo 👉 Interface Web (Frontend) : http://localhost:3002
echo 👉 API & Documentation      : http://localhost:5002/api-docs
echo 👉 Health Check API         : http://localhost:5002/health
echo ===================================================================
echo.
pause
