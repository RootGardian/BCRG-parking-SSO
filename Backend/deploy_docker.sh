#!/bin/bash
# ===================================================================
# 🚀 Script de Déploiement Docker Automatisé — Backend Parking BCRG
# ===================================================================

set -e

echo "==================================================================="
echo "  Démarrage du déploiement conteneurisé Backend Parking BCRG"
echo "  Port API : 5002 | PostgreSQL : 5432"
echo "==================================================================="

if ! command -v docker &> /dev/null; then
    echo "❌ Erreur : Docker n'est pas installé sur cette machine."
    exit 1
fi

if [ ! -f .env ]; then
    echo "ℹ️ Création du fichier .env depuis .env.example..."
    cp .env.example .env
fi

echo "📦 1/3 Construction de l'image Docker API..."
docker compose build

echo "🚀 2/3 Démarrage des conteneurs (DB + API)..."
docker compose up -d

echo "⏳ Attente de l'état opérationnel..."
sleep 5

echo "🔄 3/3 Application des migrations Prisma..."
docker compose exec -T api npx prisma db migrate || echo "⚠️ Vérifiez l'état de la base de données."

echo ""
echo "==================================================================="
echo "✅ BACKEND DÉPLOYÉ AVEC SUCCÈS !"
echo "👉 API Backend   : http://localhost:5002"
echo "👉 Documentation : http://localhost:5002/api-docs"
echo "👉 Santé API     : http://localhost:5002/health"
echo "==================================================================="
