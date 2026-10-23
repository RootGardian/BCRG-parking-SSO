@echo off
chcp 65001 > nul
echo ===================================================================
echo   Démarrage du déploiement Backend Parking BCRG (Windows)
echo   Port API : 5002 | PostgreSQL : 5432
echo ===================================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Docker Desktop n'est pas installé ou n'est pas dans le PATH !
    pause
    exit /b 1
)

if not exist .env (
    echo [INFO] Création du fichier .env depuis le modèle...
    copy .env.example .env >nul
)

echo.
echo [1/3] Construction de l'image Docker API...
docker compose build

echo.
echo [2/3] Démarrage des conteneurs (PostgreSQL + API Backend)...
docker compose up -d

echo.
echo [3/3] Application des migrations de schéma Prisma Next...
timeout /t 5 /nobreak >nul
docker compose exec -T api npx prisma db migrate

echo.
echo ===================================================================
echo [SUCCÈS] Backend déployé avec succès !
echo 👉 API Backend   : http://localhost:5002
echo 👉 Documentation : http://localhost:5002/api-docs
echo 👉 Santé API     : http://localhost:5002/health
echo ===================================================================
echo.
pause
