# Guide de Déploiement en Production - Frontend Parking BCRG

Ce dépôt contient l'application Web Frontend Next.js 16 (React 19, Tailwind CSS, PWA, TanStack Query) pour le système de gestion de Parking de la BCRG.

Ce dépôt est **100% indépendant** du dépôt Backend.

---

## 1. Prérequis

- **Docker & Docker Compose** (pour un déploiement conteneurisé)
  *OU*
- **Node.js 20+ ou 22+ LTS** (pour un déploiement direct avec PM2 ou sur Vercel/Netlify)
- Une instance de l'**API Backend Parking** déjà accessible en ligne (ex: `https://api-parking.bcrg.gn`).

---

## 2. Variables d'Environnement

Créez le fichier `.env` ou configurez ces variables dans votre panneau de déploiement :

```bash
cp .env.example .env
```

| Variable | Description | Exemple en Production |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute du serveur Next.js | `3002` |
| `NODE_ENV` | Mode de fonctionnement | `production` |
| `NEXT_PUBLIC_API_URL` | URL de l'API Backend accessible aux navigateurs | `https://api-parking.bcrg.gn` |
| `INTERNAL_API_URL` | URL de l'API Backend pour les requêtes serveur SSR (`/sso`) | `https://api-parking.bcrg.gn` |
| `NEXT_PUBLIC_BCRG_HUB_URL` | URL de l'API du portail central BCRG HUB (Backend :5001) | `https://api-hub.bcrg.gn` ou `http://<IP>:5001` |
| `NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL` | URL de l'application web du portail BCRG HUB (Frontend :3001) | `https://hub.bcrg.gn` ou `http://<IP>:3001` |

> [!IMPORTANT]
> **Points d'attention cruciaux lors du déploiement :**
> 1. Les variables commençant par `NEXT_PUBLIC_` sont figées dans le code JavaScript du navigateur lors du build. Si vous modifiez l'adresse IP du serveur ou les URLs du HUB, vous devez impérativement recompiler l'application avec `docker compose build --no-cache frontend`.
> 2. Assurez-vous que `NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL` pointe bien vers le portail Web du HUB (port 3001 ou domaine racine) et non vers le port de l'API Backend (port 5001).

---

## 3. Méthode 1 : Déploiement via Docker (Recommandé pour VPS)

Le projet utilise un build multi-stage optimisé avec le mode `standalone` de Next.js, produisant une image minimale et sécurisée (exécutée sous utilisateur non-root).

### 3.1. Cloner le dépôt et configurer l'environnement

```bash
git clone https://github.com/RootGardian/parking-SSO.git
cd parking-SSO
cp .env.example .env
# Renseigner les vraies URLs de production dans le .env
nano .env
```

### 3.2. Compiler et démarrer le conteneur

```bash
docker compose up -d --build
```

### 3.3. Vérifier que le frontend répond

```bash
curl -I http://localhost:3002
```
Le serveur doit renvoyer un statut `HTTP/1.1 200 OK` ou une redirection appropriée.

---

## 4. Méthode 2 : Déploiement sur Vercel / Netlify

1. Liez votre compte GitHub et importez le dépôt `RootGardian/parking-SSO`.
2. Définissez le framework sur **Next.js**.
3. Renseignez les variables d'environnement :
   - `NEXT_PUBLIC_API_URL`
   - `INTERNAL_API_URL`
   - `NEXT_PUBLIC_BCRG_HUB_URL`
   - `NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL`
4. Cliquez sur **Deploy**.

---

## 5. Méthode 3 : Déploiement direct avec Node.js & PM2 (Linux VM)

```bash
# Installation des dépendances
npm ci

# Compilation pour la production
npm run build

# Démarrage avec PM2 (process manager)
npm install -g pm2
pm2 start npm --name "parking-frontend" -- start
pm2 save
pm2 startup
```

---

## 6. Configuration Nginx & SSL (Reverse Proxy)

Voici la configuration Nginx recommandée pour exposer le frontend avec HTTPS et la mise en cache optimale des fichiers statiques :

```nginx
server {
    listen 80;
    server_name parking.bcrg.gn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name parking.bcrg.gn;

    ssl_certificate /etc/letsencrypt/live/parking.bcrg.gn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parking.bcrg.gn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Compression gzip pour accélérer le chargement
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache agressif pour les assets statiques immuables de Next.js
    location /_next/static {
        proxy_pass http://127.0.0.1:3002/_next/static;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy pour toutes les pages et routes dynamiques
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Commandes Utiles

- **Voir les logs du conteneur :** `docker compose logs -f --tail=100 frontend`
- **Redémarrer le service :** `docker compose restart frontend`
- **Mettre à jour avec la dernière version de Git :**
  ```bash
  git pull origin main
  docker compose up -d --build
  ```
