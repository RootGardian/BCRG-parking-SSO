#!/bin/bash
# ===================================================================
# 🚀 Script de Déploiement Docker Automatisé — Frontend Parking BCRG
# ===================================================================

set -e

echo "==================================================================="
echo "  Démarrage du déploiement conteneurisé Frontend Parking BCRG"
echo "  Port Interface : 3002"
echo "==================================================================="

if ! command -v docker &> /dev/null; then
    echo "❌ Erreur : Docker n'est pas installé sur cette machine."
    exit 1
fi

if [ ! -f .env ]; then
    echo "ℹ️ Création du fichier .env depuis .env.example..."
    cp .env.example .env
fi

echo "📦 1/2 Construction de l'image Docker Next.js standalone..."
docker compose build

echo "🚀 2/2 Démarrage du conteneur en arrière-plan..."
docker compose up -d

echo ""
echo "==================================================================="
echo "✅ FRONTEND DÉPLOYÉ AVEC SUCCÈS !"
echo "👉 Interface Web : http://localhost:3002"
echo "==================================================================="
