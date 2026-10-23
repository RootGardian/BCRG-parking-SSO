# Guide de Déploiement en Production - Backend Parking BCRG

Ce dépôt contient le code source de l'API Backend du système de gestion de Parking BCRG (Node.js 24, Express, Prisma Next 8, PostgreSQL, WebSocket).

Ce dépôt est **100% indépendant** du dépôt Frontend.

---

## 1. Prérequis Système

- **Docker & Docker Compose** (version v2 recommandée)
  *OU*
- **Node.js** v20.x ou v24.x LTS et **PostgreSQL 15+** (si déploiement direct sans Docker)
- **Nginx** ou un reverse proxy (Traefik, Caddy, AWS ALB, Cloudflare) pour la terminaison SSL / HTTPS.

---

## 2. Variables d'Environnement

Créez un fichier `.env` sur le serveur de production à la racine du dépôt (en vous basant sur `.env.example`) :

```bash
cp .env.example .env
chmod 600 .env
```

### Variables obligatoires :

| Variable | Description | Exemple en Production |
| :--- | :--- | :--- |
| `NODE_ENV` | Environnement d'exécution | `production` |
| `PORT` | Port d'écoute du serveur Node | `5002` |
| `CORS_ORIGIN` | Domaines frontend autorisés | `https://parking.bcrg.gn,https://hub.bcrg.gn` |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL | `postgresql://usr:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | Clé secrète pour signatures JWT (64 chars min) | *(générer avec `openssl rand -base64 32`)* |
| `JWT_EXPIRES_IN` | Durée de validité des tokens | `24h` |
| `PASSWORD_PEPPER` | Poivre de hachage bcrypt | *(chaîne secrète unique)* |
| `ADMIN_PASSWORD` | Mot de passe de l'admin initial | *(mot de passe fort)* |
| `BCRG_HUB_URL` | URL de l'API BCRG HUB (SSO) | `https://api-hub.bcrg.gn` |
| `BCRG_HUB_JWKS_URL` | Endpoint JWKS du HUB pour valider les tokens SSO | `https://api-hub.bcrg.gn/api/security/.well-known/jwks.json` |

---

## 3. Déploiement via Docker Compose (Méthode Recommandée)

### 3.1. Cloner le dépôt et configurer l'environnement

```bash
git clone https://github.com/RootGardian/backend_parking-sous-sol-bcrg.git
cd backend_parking-sous-sol-bcrg
cp .env.example .env
# Éditer .env avec vos valeurs secrètes
nano .env
```

### 3.2. Construire et démarrer les conteneurs

```bash
docker compose up -d --build
```

### 3.3. Appliquer les migrations de base de données

Lors du premier déploiement ou des mises à jour de schéma :

```bash
# Exécution des migrations Prisma Next
docker compose exec api npx prisma db migrate
```

### 3.4. Vérifier la santé du conteneur

```bash
curl http://localhost:5002/health
```
Réponse attendue :
```json
{
  "status": "ok",
  "service": "parking_bcrg_backend",
  "timestamp": "2026-10-22T16:00:00.000Z",
  "uptime": 42,
  "environment": "production"
}
```

---

## 4. Déploiement PaaS (Render, Railway, Fly.io, etc.)

1. Connectez le dépôt Git `RootGardian/backend_parking-sous-sol-bcrg` sur votre plateforme.
2. Créez une base de données managée **PostgreSQL**.
3. Renseignez toutes les variables d'environnement dans l'interface du fournisseur.
4. Spécifiez :
   - **Build Command** : `npm ci && npm run contract:emit`
   - **Start Command** : `npm run db:migrate && npm start`
   - **Health Check Path** : `/health`

---

## 5. Configuration Nginx & SSL (Reverse Proxy)

Créez le fichier de configuration Nginx (ex: `/etc/nginx/sites-available/api-parking.bcrg.gn`) :

```nginx
server {
    listen 80;
    server_name api-parking.bcrg.gn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api-parking.bcrg.gn;

    ssl_certificate /etc/letsencrypt/live/api-parking.bcrg.gn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-parking.bcrg.gn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Taille max des téléversements (badges / exports)
    client_max_body_size 20M;

    # Point de terminaison WebSocket (/ws)
    location /ws {
        proxy_pass http://127.0.0.1:5002/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # API REST & Health check
    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 180s;
    }
}
```

Activez le site et rechargez Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/api-parking.bcrg.gn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Maintenance & Sauvegardes

### Sauvegarder la base de données :
```bash
docker compose exec -t db pg_dump -U postgres parking_bcrg_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurer une sauvegarde :
```bash
gunzip < backup_fichier.sql.gz | docker compose exec -T db psql -U postgres parking_bcrg_db
```

### Consulter les logs en temps réel :
```bash
docker compose logs -f --tail=100 api
```
