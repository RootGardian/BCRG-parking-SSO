# 🏛️ Architecture Frontend Verticale & Guide de Développement
## Application de Gestion du Parking Sous-Sol - BCRG (Banque Centrale de la République de Guinée)

---

## 1. Principes de l'Architecture Verticale (Feature-Driven Architecture)

Pour garantir une **modularité maximale, l'isolation du code métier et la facilité de maintenance**, le projet adopte une **architecture verticale par feature**. 

### Principes Clés :
1. **Thin App Router avec Route Groups (`src/app/`)** : Le répertoire `app/` de Next.js s'appuie sur le Route Group `(dashboard)` pour isoler l'espace applicatif authentifié avec un layout `AppShell` commun. Il sert exclusivement d'aiguilleur de routes (routing bridge) et de point de montage des layouts. Les pages ne contiennent pas de logique lourde ; elles importent et affichent directement les vues situées dans `src/features/`.
2. **Encapsulation par Feature (`src/features/`)** : Chaque module métier (`admin/plaques`, `admin/utilisateurs`, `admin/mouvements`, `agent/mouvement-personnel`, `agent/mouvement-visiteur`, `auth`) contient sa propre structure canonique isolée.
3. **Partage Contrôlé (`src/components/`, `src/shared/`, `src/types/`)** : Seuls les atomes/molécules UI génériques, les types d'entités DB globales et le client API commun sont partagés.

---

## 2. Arborescence Globale du Projet (`src/`)

```text
src/
├── app/                        # Routing Next.js App Router (Ponts de routage minces)
│   ├── (auth)/
│   │   └── login/             # Page d'authentification Split-Screen
│   │       └── page.tsx
│   ├── (dashboard)/            # Route Group de l'espace applicatif authentifié
│   │   ├── layout.tsx         # Layout AppShell commun (Sidebar + Navbar)
│   │   ├── admin/             # Espace Administration & Supervision
│   │   │   ├── page.tsx       # Route /admin (Dashboard & KPIs)
│   │   │   ├── personnel/     # Route /admin/personnel (Gestion du Personnel BCRG)
│   │   │   │   └── page.tsx
│   │   │   ├── plaques/       # Route /admin/plaques (Gestion de la Flotte)
│   │   │   │   └── page.tsx
│   │   │   ├── utilisateurs/  # Route /admin/utilisateurs (Comptes & Rôles)
│   │   │   │   └── page.tsx
│   │   │   ├── mouvements/    # Route /admin/mouvements (Journal & Audit)
│   │   │   │   └── page.tsx
│   │   │   ├── parking/       # Route /admin/parking (Configuration parkings & fonctions)
│   │   │   │   └── page.tsx
│   │   │   └── profil/        # Route /admin/profil (Profil utilisateur)
│   │   │       └── page.tsx
│   │   └── agent/             # Espace Agent de Sécurité / Guichet
│   │       ├── page.tsx       # Redirection automatique vers /agent/mouvement-personnel
│   │       ├── mouvement-personnel/ # Route /agent/mouvement-personnel (Scan QR & Saisie)
│   │       │   └── page.tsx
│   │       └── mouvement-visiteur/  # Route /agent/mouvement-visiteur (Saisie rapide F2)
│   │           └── page.tsx
│   ├── layout.tsx             # Root Layout (Polices Geist/LaGuinze/Verdana & Thème)
│   ├── globals.css            # Design Tokens BCRG & Tailwind CSS v4
│   └── page.tsx               # Redirection racine (SSR vers /admin ou /login)
│
├── components/                 # Composants UI Génériques & Partagés
│   ├── ui/                    # Atomes UI (Button, Input, Dialog, Badge, StatusBadge, SearchableSelect...)
│   └── shared/                # Molécules (AppShell, Sidebar, Navbar, DataTable, FilterBar, ConfirmModal...)
│
├── features/                   # Modules Métier Isolés (Architecture Verticale)
│   ├── auth/                  # Module Authentification, Profil & Session
│   ├── admin/                 # Modules Métier Administration & Supervision
│   │   ├── dashboard/         # Dashboard & KPIs analytiques
│   │   ├── personnel/         # Gestion du Personnel BCRG, QR Codes & CSV
│   │   ├── plaques/           # Gestion de la Flotte automobile
│   │   ├── utilisateurs/      # Gestion des Comptes et Accès RBAC
│   │   ├── mouvements/        # Suivi & Audit global des mouvements
│   │   └── parking/           # Configuration des parkings, places et fonctions
│   └── agent/                 # Modules Métier Agent de Sécurité
│       ├── mouvement-personnel/ # Scan QR/Matricule, carte info, validation entrée & sortie
│       └── mouvement-visiteur/  # Enregistrement & suivi des visiteurs, raccourci F2
│
├── lib/                        # Utilitaires Généraux
│   └── utils.ts               # Helper cn() (clsx + tailwind-merge)
│
├── proxy.ts                    # Proxy Next.js (Interception réseau & contrôle d'accès RBAC)
│
├── shared/                     # Éléments Partagés Transversaux
│   ├── services/              # Client API HTTP (apiClient Axios) & ENDPOINTS
│   ├── store/                 # Store global Zustand persistant (use-auth-store)
│   └── utils/                 # Traitement centralisé des erreurs API (error-handler)
│
└── types/                      # Interfaces TypeScript Globales (Entités DB & DTOs)
    ├── index.ts               # Exports généraux
    └── models.ts              # Entités DB (Utilisateur, Personnel, Agent, Vehicule, Mouvement)
```

---

## 3. Structure Canonique d'un Module Feature (`src/features/<module>/`)

Chaque feature métier sous `src/features/` (que ce soit sous `admin/`, `agent/` ou `auth/`) suit scrupuleusement la **structure canonique** suivante :

```text
src/features/agent/mouvement-personnel/   (Exemple du module Mouvement Personnel Agent)
├── components/                 # Composants de présentation UI internes à la feature
│   ├── scan-matricule-input.tsx
│   ├── personnel-card-info.tsx
│   └── valider-entree-personnel-button.tsx
├── pages/                      # Pages métiers réelles (rendu principal de la vue)
│   └── mouvement-personnel-page.tsx
├── data/                       # Mocks et structures de démonstration isolées par module
│   └── mouvement-personnel-mocks.ts
├── hooks/                      # Hooks personnalisés (requêtes/mutations TanStack Query)
│   └── use-mouvement-personnel.ts
├── services/                   # Appels API typés via apiClient global
│   └── mouvement-personnel.service.ts
├── schemas/                    # Validateurs de formulaires et de données (Zod)
│   └── mouvement-personnel-schema.ts
└── types/                      # Types TypeScript spécifiques à la feature
    └── index.ts
```

### Rôle de chaque sous-dossier de feature :
- **`components/`** : Composants UI spécifiques au module qui ne sont pas réutilisés ailleurs.
- **`pages/`** : Composants de page complets contenant l'assemblage de la vue. La route Next.js correspondante dans `src/app/` ne fait qu'importer et rendre cette page.
- **`data/`** : Jeux de données fictifs/mocks pour tester et prototyper le module de manière isolée.
- **`hooks/`** : Custom hooks encapsulant la logique d'état, de fetching et de mutation.
- **`services/`** : Fonctions d'appels API typées consommant l'`apiClient` partagé.
- **`schemas/`** : Schémas Zod pour la validation des formulaires d'ajout/édition et des filtres.
- **`types/`** : Interfaces TypeScript et DTOs propres au périmètre du module.

---

## 4. Écosystème des Outils & Librairies Dépendantes

Le projet utilise un ensemble d'outils frontend spécialisés pour chaque dimension applicative :

| Catégorie | Outils / Libraries | Usage Métier & Responsabilité |
| :--- | :--- | :--- |
| **Formulaires & Validation** | `zod`, `react-hook-form`, `@hookform/resolvers` | Validation stricte des schémas de formulaires (login, ajouts, filtres) et inférence des types TypeScript sans re-rendus inutiles. |
| **State & Data Fetching** | `@tanstack/react-query`, `zustand`, `axios` | Client HTTP partagé avec intercepteurs JWT, cache asynchrone pour les mouvements et store global réactif pour l'état de session. |
| **Scanner & Matériel** | `html5-qrcode` | Lecture des QR Codes / badges matricules du personnel via la caméra des guichets vigiles. |
| **Analytics & Dataviz** | `recharts` | Graphiques réactifs d'affluence horaire, taux d'occupation et répartition Personnel vs Visiteurs sur le Dashboard. |
| **Imports / Exports Data** | `xlsx`, `papaparse`, `jspdf`, `jspdf-autotable` | Exportation Excel/PDF des rapports de supervision et import de masse CSV/Excel du personnel et des plaques. |
| **Notifications & Toasts** | `sonner` | Toasts de confirmation et retours d'erreurs réactifs lors des actions vigile/admin. |
| **Manipulation Temporelle** | `date-fns` | Formattage des horodatages ("Entré il y a 15 min") et calcul des durées de stationnement en français. |

---

## 5. Stratégie de Sécurité & Redirections RBAC (`src/proxy.ts`)

Pour appliquer la matrice des rôles (`admin`, `supervision`, `agent`) :

1. **Proxy Next.js (`src/proxy.ts`)** :
   - Interception du jeton de session au niveau du réseau.
   - Redirection si `Role == agent` ➡️ `/agent`.
   - Redirection si `Role == admin` ou `supervision` ➡️ `/admin`.
   - Protection des routes : Redirection vers `/login` si non authentifié.

2. **Désactivation des mutations en `supervision`** :
   - Dans les pages de `src/features/admin/`, le rôle `supervision` accède aux mêmes vues mais le bouton principal d'action dans le `PageHeader` bascule de `+ Ajouter...` à `🖨️ Imprimer / Exporter le rapport`.

---

## 6. Commandes & Qualité de Code

* **Développement** : `npm run dev`
* **Linter (Biome)** : `npm run lint`
* **Formatage (Biome)** : `npm run format`
* **Build TypeScript** : `npm run build`

---

## 7. Feuille de Route d'Implémentation (Roadmap par Feature)

### Phase 1 : Socle & Design System [Terminé]
- [x] Spécifications métier et matrice RBAC dans `documentation/01-specifications-metier.md`.
- [x] Design tokens et typographies dans `src/app/globals.css` et `src/app/layout.tsx`.
- [x] Atomes UI dans `src/components/ui/` avec JSDoc (Button, Input, Dialog, Select, SearchableSelect, etc.).
- [x] Composants Partagés dans `src/components/shared/` avec JSDoc (AppShell, Sidebar, Navbar, DataTable, FilterBar...).
- [x] Installation et intégration des dépendances projet (Zod, React Query, Zustand, Axios, Recharts, Sonner, Excel/PDF, HTML5 QR Code).
- [x] Validation Biome Linter & Build TypeScript réussi.

### Phase 2 : Entités TypeScript, Client API & Authentification [Terminé]
- [x] Modélisation des entités DB globales et DTOs (`src/types/models.ts`).
- [x] Architecture du client HTTP centralisé (`src/shared/services/api-client.ts`), intercepteurs JWT et gestion d'erreurs (`src/shared/utils/error-handler.ts`).
- [x] Module `src/features/auth/` complet (Page de login split-screen, profil utilisateur, changement obligatoire de mot de passe).
- [x] Store Zustand d'authentification persistant (`src/shared/store/use-auth-store.ts`) synchronisé avec le cookie `bcrg_session`.
- [x] Interception et routage RBAC par Proxy Next.js (`src/proxy.ts`).
- [x] Redirection racine propre côté serveur (`src/app/page.tsx`).

### Phase 3 : Modules Administration (`src/features/admin/`) [Terminé & En cours de consolidation]
- [x] `features/admin/dashboard/` : KPIs d'occupation, graphiques Recharts (trafic horaire, répartition catégories), filtre par date et tableau des mouvements récents.
- [x] `features/admin/personnel/` : CRUD personnel BCRG, génération/affichage QR Code, modal d'assignation véhicule, import CSV/Excel.
- [x] `features/admin/plaques/` : Gestion de la flotte automobile, sélection dynamique du personnel propriétaire, import CSV, modal de confirmation de suppression.
- [x] `features/admin/utilisateurs/` : Administration des comptes et des rôles (`admin`, `supervision`, `agent`), activation/désactivation, réinitialisation de mot de passe.
- [x] `features/admin/mouvements/` : Registre exhaustif des passages, filtres multicritères, modal de détails complets et modal de correction administrative.
- [x] `features/admin/parking/` : Configuration des parkings, places réservées visiteurs et référentiel des fonctions institutionnelles (consolidation multi-parking en cours).

### Phase 4 : Modules Agent de Sécurité (`src/features/agent/`) [Terminé]
- [x] `features/agent/mouvement-personnel/` : Scan QR caméra (`html5-qrcode`), recherche matricule / plaque, affichage immédiat de la fiche agent, validation d'entrée en 1 clic, tableau des présents sur site et sortie instantanée.
- [x] `features/agent/mouvement-visiteur/` : Recherche/scan plaque avec raccourci clavier `F2`, formulaire d'entrée avec motif et observation, tableau des visiteurs sur site et sortie immédiate.
- [x] Synchronisation temps réel du taux d'occupation sur le bandeau agent (`parking-status-bar.tsx`).

### Phase 5 : Tests Automatisés & Durcissement Production [Prochaine étape]
- [ ] Tests unitaires et d'intégration sur les services, schémas Zod et custom hooks (Vitest / Testing Library).
- [ ] Tests end-to-end sur les workflows critiques de guichet vigile et d'administration (Playwright).
- [ ] Finalisation de l'intégration multi-parking (`src/features/admin/parking/`).

