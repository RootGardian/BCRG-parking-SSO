# 🚗 BCRG Parking Sous-Sol - Frontend Next.js

Application web institutionnelle de **gestion, traçabilité et contrôle d'accès au parking sous-sol de la Banque Centrale de la République de Guinée (BCRG)**.

---

## 📌 Présentation du Projet

Cette application web moderne est conçue avec **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 et Biome**. Elle permet d'assurer :
1. **Contrôle d'accès rapide au guichet** (Vigiles/Agents) par scan de badge/matricule ou enregistrement de visiteurs.
2. **Gestion complète de la flotte et du personnel** (Administrateurs) avec import/export de données.
3. **Supervision et audit analytique en temps réel** (Supervision) en mode lecture seule avec tirage de rapports officiels.

---

## 📚 Documentation du Projet

Toute la documentation détaillée par domaine est organisée dans le dossier [`documentation/`](./documentation) :

* 📄 **[Spécifications Métier & Matrice RBAC](./documentation/01-specifications-metier.md)** : Description des rôles (`agent`, `admin`, `supervision`), règles métier et scénarios d'usage.
* 🎨 **[Architecture du Design System & Composants UI](./documentation/02-architecture-design-system.md)** : Design Tokens BCRG, typographies, thème Tailwind v4 et catalogue des composants réutilisables.
* 🏛️ **[Architecture Frontend & Guide de Développement](./documentation/03-architecture-frontend.md)** : Arborescence modulaire verticale `src/`, structure canonique des features, écosystème d'outils et roadmap.

---

## 🔐 Intégration Single Sign-On (SSO) BCRG HUB

L'application Frontend est interconnectée avec le **BCRG HUB** pour une connexion transparente sans réauthentification (Single Sign-On fédéré avec l'Active Directory) :

### 🔄 Flux d'authentification SSO
1. L'agent clique sur la carte Parking depuis le portail BCRG HUB.
2. Le HUB redirige le navigateur vers `/login?sso_token=<JETON_JWT>`.
3. Le composant `login-form.tsx` intercepte automatiquement le jeton et appelle l'API Backend `POST /api/auth/sso-login`.
4. Le profil utilisateur normalisé est stocké dans le store Zustand (`useAuthStore`) et dans les cookies de session (`bcrg_session`, `bcrg_user_role`).
5. Une redirection immédiate (`window.location.replace()`) achemine l'utilisateur vers son espace dédié (`/admin`, `/agent`, ou `/personnel`).

### 🛠️ Composants ajoutés & modifiés
- **`src/app/sso/route.ts`** : Route Handler Next.js capable de recevoir et traiter le jeton en GET/POST avec génération des cookies de session.
- **`src/app/page.tsx`** : Transmission transparente de `?sso_token=...` vers la mire de connexion sans perte de query string.
- **`src/features/auth/components/login-form.tsx`** : Détection réactive du `sso_token`, loader visuel, et bouton *"Connexion unique via BCRG HUB (SSO)"*.
- **`src/features/auth/services/auth.service.ts`** : Méthode `loginWithSso` pour validation auprès du Backend.
- **`src/features/admin/utilisateurs/schemas/utilisateurs-schema.ts`** : Validation Zod adaptée aux comptes Active Directory (acceptation des identifiants avec points et tirets, ex: `mamadoub.barry`).

---

## 🛠️ Stack Technique & Écosystème

* **Core Framework** : [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
* **Langage & Formateur** : [TypeScript 5](https://www.typescriptlang.org/) & [Biomejs 2.4](https://biomejs.dev/)
* **Styles & Thème** : [Tailwind CSS v4](https://tailwindcss.com/), Shadcn UI Patterns, Lucide Icons
* **Formulaires & Validations** : `react-hook-form`, `zod`, `@hookform/resolvers`
* **Gestion d'État & Data Fetching** : `@tanstack/react-query` (v5), `zustand`, `axios`
* **Graphiques & Analytics** : `recharts`
* **Scanner Badge / QR Code** : `html5-qrcode`
* **Reporting & Imports/Exports** : `jspdf`, `jspdf-autotable`, `xlsx`, `papaparse`
* **Notifications & UX** : `sonner`, `date-fns` (Locale FR)
* **Polices Institutionnelles** : `LaGuinze` (Police de marque BCRG), `Verdana`, `Geist`

---

## 🧱 Composants UI Réutilisables

### Atomes UI (`src/components/ui/`)
- **`Button`** : Bouton d'action réutilisable avec états de chargement (`isLoading`) et variantes de marque.
- **`Input`** : Champ de saisie avec icônes gauche/droite, masque mot de passe (`Eye`/`EyeOff`), labels et erreurs.
- **`Badge` & `StatusBadge`** : Pastilles de statut (`Sur site` avec voyant animé, `Hors site`) et rôles (`Admin`, `Supervision`, `Agent`).
- **`Card`** : Bloc d'affichage réutilisable (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`).
- **`Dialog`** : Fenêtre modale accessible avec fond flouté et fermeture Échap.
- **`Tabs`** : Onglets de bascule (`TabsList`, `TabsTrigger`, `TabsContent`).
- **`DropdownMenu`** : Menu contextuel déroulant (Profil Navbar, Actions de tableau).
- **`Select`**, **`Skeleton`**, **`Avatar`**, **`Tooltip`**.

### Composants Molécules & Layouts (`src/components/shared/`)
- **`AppShell`** : Layout conteneur assemblant la Sidebar, la Navbar et le contenu principal.
- **`Sidebar`** : Menu latéral rétractable (collapsible) avec logo BCRG et état actif.
- **`Navbar`** : Header supérieur avec rôle actif et menu profil (`Nom & Matricule`).
- **`PageHeader`** : En-tête de section (Titre, Description, Bouton d'action principal).
- **`KPICard` & `KPICardsGrid`** : Cartes de synthèses chiffrées avec tendance et icône.
- **`FilterBar` & `FilterModal`** : Barre de recherche rapide et modal de filtres avancés.
- **`DataTable` & `Pagination`** : Tableau générique réutilisable avec tri, skeletons, et pagination.

---

## 🚀 Prise en main & Installation

1. **Cloner le projet et installer les dépendances** :
   ```bash
   git clone https://github.com/Bano-Barry/projet-front-parking_sous_sol_bcrg.git
   cd projet-front-parking_sous_sol_bcrg
   npm install
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

3. **Formater et vérifier le code (Biome)** :
   ```bash
   npm run format
   npm run lint
   ```

4. **Compiler pour la production** :
   ```bash
   npm run build
   ```

---
*Projet développé pour la Banque Centrale de la République de Guinée (BCRG).*
