@echo off
chcp 65001 > nul
echo ===================================================================
echo   Démarrage du déploiement Frontend Parking BCRG (Windows)
echo   Port Interface : 3002
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
echo [1/2] Construction de l'image Docker Next.js standalone...
docker compose build

echo.
echo [2/2] Démarrage du conteneur Frontend sur le port 3002...
docker compose up -d

echo.
echo ===================================================================
echo [SUCCÈS] Frontend déployé avec succès !
echo 👉 Ouvrez votre navigateur sur : http://localhost:3002
echo ===================================================================
echo.
pause
