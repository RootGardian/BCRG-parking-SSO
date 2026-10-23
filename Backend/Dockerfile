# ==============================================================================
# Dockerfile Production - Backend API Parking BCRG (Node.js + Prisma Next)
# ==============================================================================
FROM node:24-alpine

# Installation de dumb-init pour la gestion propre des signaux POSIX (SIGTERM / SIGINT)
RUN apk add --no-cache dumb-init

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=5002

# Copier les descripteurs de dépendances
COPY package*.json ./

# Installer toutes les dépendances (npm ci garantit la cohérence du package-lock.json)
RUN npm ci

# Copier le code source de l'application
COPY . .

# Générer les types du contrat Prisma Next
RUN npm run contract:emit

# Créer le répertoire des téléversements (uploads)
RUN mkdir -p uploads

# Exposer le port de l'API
EXPOSE 5002

# Vérification de santé du conteneur (Health Check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Utiliser dumb-init comme PID 1 pour transmettre fidèlement les signaux d'arrêt
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Démarrer le serveur API
CMD ["npm", "start"]
