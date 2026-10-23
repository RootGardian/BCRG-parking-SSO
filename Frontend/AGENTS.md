<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Règles & Directives de Développement pour le Projet BCRG Parking Sous-Sol

Ce document définit les règles d'architecture, les normes de codage, la gestion de la documentation et les conventions UX/UI obligatoires pour le développement du projet **BCRG Parking Sous-Sol**.

---

## 🏛️ 1. Architecture Verticale & Structure Canonique de Feature

1. **Thin Next.js App Router (`src/app/`) avec Route Group `(dashboard)`** :
   - Le dossier `src/app/` sert uniquement de pont de routage et de montage des layouts via les Route Groups (`src/app/(auth)/login/`, `src/app/(dashboard)/admin/`, `src/app/(dashboard)/agent/`).
   - Aucune logique métier lourde ne doit résider dans les fichiers `page.tsx` de `src/app/`. Ceux-ci importent et affichent les vues composées situées dans `src/features/`.

2. **Structure Canonique Obligatoire pour toute Feature (`src/features/<domaine>/<module>/`)** :
   Chaque module sous `src/features/` doit respecter scrupuleusement l'arborescence suivante :
   ```text
   src/features/<domaine>/<module>/
   ├── components/           # Composants de présentation UI internes à la feature
   ├── pages/                # Pages métiers réelles (sans le suffixe -view)
   ├── data/                 # Mocks et structures de démonstration isolées par module
   ├── hooks/                # Custom hooks (ex: use-<module>.ts pour requêtes/mutations Query)
   ├── services/             # Appels API typés via le client HTTP global (apiClient)
   ├── schemas/              # Validateurs de formulaires et filtres Zod (ex: <module>-schema.ts)
   └── types/                # Types TypeScript et DTOs spécifiques à la feature (index.ts)
   ```

3. **Modules Agent Distincts** :
   - Les fonctionnalités agent sous `src/features/agent/` doivent être strictement séparées en deux modules canoniques distincts :
     - `src/features/agent/mouvement-personnel/` (Scan QR/Matricule, carte info personnel).
     - `src/features/agent/mouvement-visiteur/` (Enregistrement visiteurs avec motif et observation).

---

## 🎨 2. Design System, Typographies & UI Components

1. **Design Tokens & Thème** :
   - Utiliser exclusivement les tokens de marque BCRG et le thème Tailwind v4 définis dans `src/app/globals.css` (`--brand-green-700`, `--brand-yellow-500`, `--brand-red-700`, etc.).
   - Utiliser la police `LaGuinze` (`font-brand`) pour tous les titres `h1`-`h6`, `Verdana` (`font-sans`) pour le corps de texte.

2. **Réutilisation des Composants UI** :
   - Ne pas recréer de composants UI au cas par cas. Toujours réutiliser les atomes de `src/components/ui/` (`Button`, `Input`, `Dialog`, `Badge`, `StatusBadge`, `Card`, `Tabs`, `DropdownMenu`, `Select`, `Skeleton`, `Avatar`, `Tooltip`).
   - Réutiliser systématiquement les molécules de `src/components/shared/` (`AppShell`, `Sidebar`, `Navbar`, `PageHeader`, `KPICardsGrid`/`KPICard`, `FilterBar`, `FilterModal`, `DataTable`, `Pagination`).

3. **Anatomie Standardisée des Pages de Section** :
   Chaque vue de section (hors Dashboard) suit l'assemblage :
   - `PageHeader` (Titre + Description à gauche, Bouton d'action d'ajout à droite).
   - `KPICardsGrid` & `KPICard`.
   - `FilterBar` (Recherche rapide + Bouton d'ouverture de `FilterModal`).
   - `DataTable` (avec tri, skeletons et menu d'actions par ligne).
   - `Pagination` en pied de page.

---

## 🔐 3. Rôles & Matrice RBAC (`admin`, `supervision`, `agent`)

1. **Protection des Routes & Proxy Next.js (`src/proxy.ts`)** :
   - L'interception réseau et le contrôle d'accès sont délégués au **Proxy Next.js (`src/proxy.ts`)**.
   - Redirection automatique selon le rôle de l'utilisateur connecté (`agent` ➡️ `/agent`, `admin`/`supervision` ➡️ `/admin`, non authentifié ➡️ `/login`).

2. **Rôle `supervision` (Read-Only Mirror)** :
   - Le profil `supervision` accède exactement aux mêmes pages que l'`admin` (`/admin`).
   - **Restriction d'Écriture** : Masquer ou désactiver tous les boutons d'action de mutation (Créer, Éditer, Supprimer, Réinitialiser mot de passe, Importer CSV).
   - **Droit Exclusif** : Le bouton principal de section bascule de `+ Ajouter...` à `🖨️ Imprimer / Exporter le rapport`.

---

## ⚙️ 4. Bonnes Pratiques Software Engineering & Frontend

1. **Principes Software Craftsmanship (SOLID, DRY, KISS)** :
   - **Single Responsibility Principle (SRP)** : Un fichier = une responsabilité claire. Les composants de présentation (`components/`) ne gèrent pas d'appels API directs ; ceux-ci sont délégués aux `services/` et `hooks/`.
   - **DRY (Don't Repeat Yourself)** : Aucune duplication de logique métier, de composants UI ou de règles de validation.
   - **KISS (Keep It Simple, Stupid)** : Privilégier les solutions simples, lisibles et directement maintenables.

2. **Validation des Données & Formulaires (Zod & TypeScript)** :
   - Tous les formulaires d'entrée, d'édition et de filtrage doivent être validés par des schémas **Zod** (`src/features/<module>/schemas/`).
   - Inférence automatique des types TypeScript à partir des schémas Zod (`z.infer<typeof schema>`).

3. **Accessibilité & Ergonomie Guichet (WCAG AAA/AA)** :
   - **Accessibilité Clavier** : Tous les éléments interactifs doivent posséder un focus ring visible (`focus-visible:ring-focus-ring`) et être accessibles sans souris.
   - **Sémantique HTML5** : Utilisation stricte des balises sémantiques (`<main>`, `<header>`, `<nav>`, `<aside>`, `<button>`, `<table>`).
   - **Raccourcis Guichet Vigile** : Prise en charge des raccourcis clavier (`F2` recherche, `Escape` fermer modale, `Enter` valider) et détection du scan rapide par lecteur de code-barres / QR Code.

4. **Gestion des Erreurs & États d'Interface (Robustesse)** :
   - **Pas d'exception avalée** : Interdiction absolue des blocs `catch` vides.
   - **États d'Interface Explicites** : Traiter systématiquement les 4 états d'une vue (Chargement via `Skeleton`, Succès, Erreur explicite, et Liste vide `EmptyState`).
   - **Mises à Jour Optimistes** : Utilisation de `useOptimistic` (React 19) pour les actions instantanées des vigiles au guichet.

---

## 📖 5. Documentation & JSDoc

1. **Documentation Code (JSDoc en Français)** :
   - Tous les composants, interfaces, props, hooks et fonctions utilitaires doivent être accompagnés d'une documentation **JSDoc en français (`/** ... */`)**.

2. **Dossier de Documentation Projet (`documentation/`)** :
   - Maintenir à jour les 3 fichiers de référence à chaque grande étape ou évolution d'architecture :
     - `documentation/01-specifications-metier.md`
     - `documentation/02-architecture-design-system.md`
     - `documentation/03-architecture-frontend.md`
   - Conserver les liens relatifs à jour dans le `README.md`.

---

## 🛠️ 6. Qualité du Code & Linter (Biome)

1. **Exécution des Commandes de Qualité** :
   - Toujours exécuter `npm run format` et `npm run lint` avant de finaliser une tâche.
   - Le code doit comporter **0 erreur et 0 avertissement Biome**.
2. **Typage Strict** :
   - Aucun `any` toléré. Définir des types explicites et importer les types React sous la forme `import type * as React from "react";`.

## 7. Ne jamais utiliser/inclure des stickers/emoji dans l'interface utilisateur
