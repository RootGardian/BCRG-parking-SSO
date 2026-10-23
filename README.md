# Parking BCRG — Plateforme Globale de Gestion du Parking Sous-Sol

Bienvenue sur le projet **Parking BCRG** (Banque Centrale de la République de Guinée).  
Cet espace regroupe l'application complète, organisée en deux sous-projets indépendants et interconnectés : le **Backend** (API REST & Services) et le **Frontend** (Interface Web moderne Next.js).

---

## 📁 Architecture du Répertoire

```text
Parking_BCRG/
├── Backend/                 # API REST Node.js (TypeScript, Express v5, Prisma Next)
│   ├── src/                 # Code source (Controllers, Services, Routes, Middlewares)
│   ├── migrations/          # Migrations Prisma de la base PostgreSQL
│   ├── Dockerfile           # Image Docker de l'API Backend
│   ├── .env.example         # Variables d'environnement Backend
│   └── README.md            # Documentation détaillée de l'API Backend & SSO
│
├── Frontend/                # Application Web Next.js 16 (React 19, Tailwind CSS)
│   ├── src/                 # Composants, Pages (App Router), Hooks, Features
│   ├── documentation/       # Spécifications métier et architecture UI
│   ├── .env.example         # Variables d'environnement Frontend
│   └── README.md            # Documentation détaillée de l'Interface Frontend
│
├── docker-compose.yml       # Orchestration locale (PostgreSQL + Backend)
└── README.md                # Ce document de synthèse
```

---

## 🚀 Démarrage Rapide en Développement

### 1. Démarrer le Backend
```bash
cd Backend
npm install
# Assurez-vous d'avoir configuré le fichier .env (cf. .env.example)
npm run dev
```
> L'API démarre par défaut sur `http://localhost:5002` (ou le port défini dans `PORT`).  
> La documentation Swagger est consultable sur `http://localhost:5002/api-docs`.

### 2. Démarrer le Frontend
```bash
cd Frontend
npm install
# Assurez-vous d'avoir configuré le fichier .env.local (cf. .env.example)
npm run dev
```
> L'interface Web démarre sur `http://localhost:3002`.

---

## 🐳 Déploiement avec Docker Compose

Pour démarrer la base de données PostgreSQL et l'API Backend en une seule commande :

```bash
docker-compose up -d
```

Pour arrêter les conteneurs :
```bash
docker-compose down
```

---

## 🔐 Authentification & Single Sign-On (SSO) BCRG HUB

Le système intègre une authentification locale sécurisée (JWT, Bcrypt + Pepper) ainsi qu'une fédération d'identité **Single Sign-On (SSO)** via le portail central **BCRG HUB** :
- **Backend SSO** : Décodage et vérification asymétrique via JWKS du HUB, réconciliation automatique avec l'Active Directory, création transparente des comptes.
- **Frontend SSO** : Capture du paramètre `?sso_token=...` à la racine `/` et sur `/login`, puis redirection automatique et fluide vers l'espace utilisateur dédié.

Consultez les documentations détaillées dans :
- [Documentation Backend](file:///c:/Users/alber/OneDrive%20-%20Ynov/Documents/Parking_BCRG/Backend/README.md)
- [Documentation Frontend](file:///c:/Users/alber/OneDrive%20-%20Ynov/Documents/Parking_BCRG/Frontend/README.md)
