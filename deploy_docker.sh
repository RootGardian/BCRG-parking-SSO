#!/bin/bash
# ===================================================================
# 🚀 Script de Déploiement Docker Automatisé — Parking BCRG (Linux)
# ===================================================================

set -e

echo "==================================================================="
echo "  Démarrage du déploiement conteneurisé Parking BCRG"
echo "  Backend sur port 5002 | Frontend sur port 3002"
echo "==================================================================="

# Vérifier si Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    echo "❌ Erreur : Docker n'est pas installé sur cette machine."
    exit 1
fi

# Copier .env si non présent
if [ ! -f .env ]; then
    echo "ℹ️ Création du fichier .env à partir du modèle .env.docker.example..."
    cp .env.docker.example .env
fi

if [ ! -f Backend/.env ]; then
    echo "ℹ️ Création du fichier Backend/.env..."
    cp Backend/.env.example Backend/.env
fi

if [ ! -f Frontend/.env ]; then
    echo "ℹ️ Création du fichier Frontend/.env..."
    cp Frontend/.env.example Frontend/.env
fi

echo "📦 1/4 Construction des images Docker (Backend & Frontend)..."
docker compose build

echo "🚀 2/4 Démarrage des conteneurs en arrière-plan..."
docker compose up -d

echo "⏳ 3/4 Attente de l'état opérationnel de PostgreSQL et Backend..."
sleep 6

echo "🔄 4/4 Application des migrations de base de données Prisma..."
docker compose exec -T backend npx prisma db migrate || echo "⚠️ Attention : vérifiez la connexion DB pour les migrations."

echo ""
echo "==================================================================="
echo "✅ DÉPLOIEMENT RÉUSSI AVEC SUCCÈS !"
echo "👉 Interface Web (Frontend) : http://localhost:3002"
echo "👉 API & Swagger (Backend)  : http://localhost:5002/api-docs"
echo "👉 Healthcheck API          : http://localhost:5002/health"
echo "==================================================================="
