# Guide de Déploiement & Exploitation — Parking BCRG Full Stack

Plateforme globale de gestion du Parking Sous-Sol de la **Banque Centrale de la République de Guinée (BCRG)** avec fédération Single Sign-On (**BCRG HUB**).

- 📱 **Génération automatique des QR Codes** : Tout agent ou cadre se connectant (via SSO BCRG HUB ou identifiants) dispose immédiatement de son badge QR Code d'accès sur son Espace Personnel dès sa 1ère connexion.
- 🏢 **Contrôle d'accès & Registre vigile** : Scan QR en temps réel (email ou matricule), gestion des entrées/sorties et places réservées.
- 🔐 **Fédération d'identité SSO** : Intégration fluide avec le BCRG HUB et Active Directory.

---

## 🏗️ Architecture du Projet

```text
Parking_BCRG/
├── Backend/                 # API REST Node.js (TypeScript, Express v5, Prisma Next)
│   ├── src/                 # Contrôleurs, Services (SSO, Admin, Mouvement), Prisma
│   ├── .env.example         # Template variables backend
│   └── README.md            # Spécifications API backend
│
├── Frontend/                # Application Web Next.js 16 (React 19, Tailwind CSS)
│   ├── src/                 # App Router, Features, Composants UI, Scanner QR
│   ├── .env.example         # Template variables frontend
│   └── README.md            # Spécifications UI frontend
│
├── docker-compose.yml       # Orchestration complète (db + backend + frontend)
├── .env.docker.example      # Template variables Docker Compose
├── deploy_docker.sh         # Script de déploiement automatique Linux / Bash
├── deploy_docker.bat        # Script de déploiement automatique Windows / CMD
└── README.md                # Ce document guide
```

---

## ⚡ Procédure Standard de Déploiement (Production & Homologation)

### Étape 1 : Cloner le dépôt
```bash
git clone https://github.com/RootGardian/BCRG-parking-SSO.git
cd BCRG-parking-SSO
```

### Étape 2 : Configurer les 2 fichiers `.env`

#### 1. Fichier `Backend/.env` (Configuration de l'API & Base de données)
```bash
cp Backend/.env.example Backend/.env
nano Backend/.env
```
Paramètres essentiels à renseigner :
```env
NODE_ENV=production
PORT=5002
CORS_ORIGIN=*

# Base de données PostgreSQL (service docker 'db')
DATABASE_URL=postgresql://postgres:bcrg_secure_password@db:5432/parking_bcrg_db?schema=public

# Sécurité JWT interne Parking
JWT_SECRET=votre_cle_secrete_interne_parking_tres_robuste_2026
JWT_EXPIRES_IN=24h
PASSWORD_PEPPER=votre_poivre_cryptographique_2026

# Administrateur initial (créé automatiquement au premier démarrage)
ADMIN_NOM=Admin
ADMIN_PRENOM=Principal
ADMIN_MATRICULE=ADMIN-001
ADMIN_PASSWORD=Bcrg@Admin2026!
ADMIN_DOIT_CHANGER_MDP=false

# ==============================================================================
# FÉDÉRATION SSO AVEC LE BCRG HUB (IMPORTANT)
# ==============================================================================
# URL racine du backend du HUB
BCRG_HUB_URL=http://<IP_OU_DOMAINE_HUB>:5001

# Endpoint JWKS du HUB
BCRG_HUB_JWKS_URL=http://<IP_OU_DOMAINE_HUB>:5001/api/security/.well-known/jwks.json

# Clé HMAC partagée avec le HUB : DOIT ÊTRE IDENTIQUE au JWT_SECRET du HUB !
BCRG_HUB_JWT_SECRET=supersecret_bcrg_hub_production_jwt_key_2026
```

#### 2. Fichier `Frontend/.env` (Configuration de l'Interface Web)
```bash
cp Frontend/.env.example Frontend/.env
nano Frontend/.env
```
Paramètres essentiels à renseigner :
```env
PORT=3002
NODE_ENV=production

# URLs de l'API Parking (accessibles par les navigateurs des utilisateurs)
NEXT_PUBLIC_API_URL=http://<IP_OU_DOMAINE_SERVEUR>:5002
INTERNAL_API_URL=http://backend:5002

# Fédération SSO BCRG HUB
NEXT_PUBLIC_BCRG_HUB_URL=http://<IP_OU_DOMAINE_HUB>:5001
NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL=http://<IP_OU_DOMAINE_HUB>:3001
```

> [!IMPORTANT]
> Les variables qui commencent par `NEXT_PUBLIC_*` sont compilées en dur dans le code JavaScript envoyé aux navigateurs. Si vous modifiez l'adresse IP du serveur ou du HUB, vous devez impérativement recompiler le Frontend (`docker compose build --no-cache frontend`).

---

### Étape 3 : Lancer le déploiement Docker

```bash
docker compose up -d --build
```

Vérifier l'état des services :
```bash
docker compose ps
```
Les 3 conteneurs doivent afficher le statut `Up` :
- `parking_bcrg_db` : port 5432
- `parking_bcrg_api` : port 5002
- `parking_bcrg_frontend` : port 3002

---

## 🛠️ Guide de Résolution des Problèmes Connus (FAQ Erreurs)

Ce guide récapitule toutes les erreurs d'environnement déjà identifiées et leurs solutions directes :

### 1. Erreur : `Conflict. The container name "/parking_bcrg_..." is already in use`
- **Cause :** D'anciens conteneurs avec le même nom tournent déjà sur la machine.
- **Solution :** Supprimer les anciens conteneurs en conflit et relancer :
  ```bash
  docker rm -f parking_bcrg_db parking_bcrg_api parking_bcrg_frontend 2>/dev/null
  docker compose up -d
  ```

---

### 2. Erreur : `column utilisateur.session_id does not exist` ou `column utilisateur.email does not exist`
- **Cause :** Nouvelle colonne ajoutée au code Prisma mais non présente dans l'ancienne base PostgreSQL existante.
- **Solution :** Ajouter les colonnes manquantes directement dans PostgreSQL :
  ```bash
  docker exec -i parking_bcrg_db psql -U postgres -d parking_bcrg_db -c "ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS session_id text;"
  docker exec -i parking_bcrg_db psql -U postgres -d parking_bcrg_db -c "ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS email text UNIQUE;"
  ```

---

### 3. Erreur SSO : `Jeton SSO HMAC invalide ou expiré : invalid signature`
- **Cause :** La clé `BCRG_HUB_JWT_SECRET` dans `Backend/.env` ne correspond pas au `JWT_SECRET` configuré dans le fichier `.env` du BCRG HUB.
- **Solution :**
  1. Vérifier la clé exacte dans le HUB :
     ```bash
     cat /chemin/vers/bcrg_hub_repo/.env | grep JWT_SECRET
     ```
  2. Reporter cette valeur dans `Backend/.env` :
     ```env
     BCRG_HUB_JWT_SECRET=<valeur_copiee>
     ```
  3. Redémarrer l'API :
     ```bash
     docker restart parking_bcrg_api
     ```
  *(Note : Le backend Parking inclut également une liste de repli automatique sur les clés standards de dev et de production pour faciliter l'homologation).*

---

### 4. Erreur : `Trop de requêtes, veuillez réessayer dans 15 minutes`
- **Cause :** Le limiteur d'attaques par force brute bloquait l'adresse IP globale suite à des tentatives répétées ou à un grand nombre d'utilisateurs simultanés.
- **Solution déjà intégrée dans le code :**
  - Les routes SSO (`/api/auth/sso-login`, `/api/auth/sso`, `/api/auth/slo`) sont totalement exemptées du limiteur de requêtes.
  - Le composant de connexion frontend utilise une référence mémoire (`useRef`) empêchant tout rejeu de jeton en boucle infinie.
  - Si un blocage manuel intervient pendant des tests, débloquer l'IP immédiatement en redémarrant l'API :
    ```bash
    docker restart parking_bcrg_api
    ```

---

### 5. Le bouton SSO redirige vers le port `5001` (Backend) au lieu du port `3001` (Portail HUB)
- **Cause :** Le Frontend a été compilé avec `NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL` pointant sur le port backend.
- **Solution :** Dans `Frontend/.env`, vérifier que l'URL est bien :
  ```env
  NEXT_PUBLIC_BCRG_HUB_FRONTEND_URL=http://<IP_SERVEUR>:3001
  ```
  Puis reconstruire le Frontend sans cache :
  ```bash
  docker compose build --no-cache frontend && docker compose up -d frontend
  ```

---

## 🔄 Réinitialisation Complète à Zéro (Clean Slate)

Pour repartir d'un environnement vierge et propre sur un nouveau serveur :

```bash
# 1. Arrêter et supprimer conteneurs et volumes
docker rm -f parking_bcrg_db parking_bcrg_api parking_bcrg_frontend 2>/dev/null
docker volume rm parking_bcrg_postgres_data parking_bcrg_api_uploads 2>/dev/null

# 2. Configurer les environnements (cf. Étape 2)
# 3. Lancer la compilation complète
docker compose up -d --build
```
