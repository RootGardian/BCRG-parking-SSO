# ==============================================================================
# Dockerfile Multi-Stage Production - Frontend Next.js 16 (Parking BCRG)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Étape Dépendances
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# 2. Étape de Build (Compilation de l'application Next.js)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de build (les variables NEXT_PUBLIC_* sont injectées dans le bundle JS au build)
ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ARG NEXT_PUBLIC_BCRG_HUB_URL
ARG NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    INTERNAL_API_URL=$INTERNAL_API_URL \
    NEXT_PUBLIC_BCRG_HUB_URL=$NEXT_PUBLIC_BCRG_HUB_URL \
    NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL=$NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# ------------------------------------------------------------------------------
# 3. Étape d'Exécution en Production (Image minimale ~150 Mo)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME="0.0.0.0"

# Création d'un groupe et utilisateur système sans privilèges root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copie des fichiers publics statiques
COPY --from=builder /app/public ./public

# Préparer le dossier de cache Next.js avec les bonnes permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copie du serveur Next.js autonome (standalone) et des assets statiques compilés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Basculer vers l'utilisateur non-root
USER nextjs

# Exposer le port d'écoute
EXPOSE 3002

# Vérification de santé (Health Check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/ || exit 1

# Démarrer le serveur Next.js en production
CMD ["node", "server.js"]
