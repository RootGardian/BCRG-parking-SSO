# 🎨 Architecture du Design System & Composants UI
## Application de Gestion du Parking Sous-Sol - BCRG

---

## 1. Design Tokens & Identité Visuelle BCRG

Le système de design repose sur une palette de couleurs institutionnelles et sémantiques configurée dans `src/app/globals.css` et exposée à Tailwind CSS v4 via `@theme inline`.

### Palette de Couleurs Institutionnelles
* **Vert Institutionnel BCRG** : `--brand-green-700: #1d433b` *(Couleur primaire de marque)*
* **Or / Accentuation** : `--brand-yellow-500: #b49c10` *(Rôle Supervision & Accents)*
* **Orange / Statuts** : `--brand-orange-600: #e74920` / `--brand-orange-500: #f29111`
* **Rouge Destructif** : `--brand-red-700: #b74120` *(Actions d'annulation & erreurs)*

### Polices de Caractères
* **`LaGuinze`** *(Font locale OTF : Regular, Italic, Bold)* ➔ Utilisée via `--font-laguinze` pour tous les titres et en-têtes (`h1` à `h6`).
* **`Verdana`** *(Font locale TTF)* ➔ Utilisée via `--font-verdana` pour le texte courant et les éléments d'interface.
* **`Geist`** *(Google Font)* ➔ Chargée dynamiquement via `--font-geist`.

---

## 2. Inventaire des Composants Atomiques (`src/components/ui/`)

Chaque composant atomique est encapsulé dans `src/components/ui/`, réutilisable et documenté en JSDoc :

| Composant | Fichier | Description & Utilisation |
| :--- | :--- | :--- |
| **`Button`** | `button.tsx` | Bouton universel avec variantes (`default`, `destructive`, `outline`, `secondary`, `ghost`, `gold`), tailles (`sm`, `md`, `lg`, `icon`) et état `isLoading`. |
| **`Input`** | `input.tsx` | Champ de saisie avec icônes gauche/droite, masque mot de passe interactif (`Eye`/`EyeOff`), labels et erreurs. |
| **`Badge`** | `badge.tsx` | Pastilles de couleur génériques (`default`, `secondary`, `destructive`, `success`, `outline`, `gold`). |
| **`StatusBadge`** | `status-badge.tsx` | Badge métier affichant les statuts `Sur site` (dot émeraude animé), `Hors site` (Slate) et les rôles (`Admin`, `Supervision`, `Agent`). |
| **`Card`** | `card.tsx` | Structure de carte composite (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`). |
| **`Dialog`** | `dialog.tsx` | Boîte de dialogue modale accessible avec fond flouté, fermeture par Échap et blocage du défilement d'arrière-plan. |
| **`Tabs`** | `tabs.tsx` | Onglets de bascule (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) pour les modes Personnel vs Visiteur. |
| **`DropdownMenu`** | `dropdown-menu.tsx` | Menu déroulant contextuel pour le profil Navbar et les menus d'action par ligne de tableau. |
| **`Select`** | `select.tsx` | Liste déroulante customisée avec support de placeholder, labels et erreurs. |
| **`Skeleton`** | `skeleton.tsx` | Effet de chargement pulsant pour les DataTables et les cartes KPIs. |
| **`Avatar`** | `avatar.tsx` | Avatar utilisateur avec image dynamique ou fallback automatique sur les initiales. |
| **`Tooltip`** | `tooltip.tsx` | Info-bulle flottante au survol ou au focus clavier. |

---

## 3. Inventaire des Composants Molécules & Shared (`src/components/shared/`)

Les composants de structure et de layout réutilisables sur toutes les pages :

| Composant | Fichier | Rôle UX & Structure |
| :--- | :--- | :--- |
| **`AppShell`** | `app-shell.tsx` | Layout d'application global assemblant Sidebar, Navbar et zone de contenu principale. |
| **`Sidebar`** | `sidebar.tsx` | Menu latéral rétractable (collapsible) avec logo BCRG, liens actifs et indicateur d'état système. |
| **`Navbar`** | `navbar.tsx` | Header supérieur affichant le rôle actif à gauche et le menu profil (`Nom & Matricule`) à droite. |
| **`PageHeader`** | `page-header.tsx` | En-tête de section (Titre + Description à gauche, Bouton d'action d'ajout à droite avec respect du rôle `supervision`). |
| **`KPICard` & `KPICardsGrid`** | `kpi-card.tsx` | Grille de cartes d'indicateurs chiffrés avec tendance et icône. |
| **`FilterBar` & `FilterModal`** | `filter-bar.tsx` | Barre de recherche rapide + modal de filtrage multicritères avec compteur de filtres actifs. |
| **`DataTable`** | `data-table.tsx` | Tableau générique avec colonnes dynamiques, tri, skeletons de chargement, état vide et pagination. |
| **`Pagination`** | `pagination.tsx` | Pied de tableau gérant le résumé des éléments, la sélection du nombre de lignes par page et la navigation. |

---

## 4. Helper Utilitaires (`src/lib/utils.ts`)

- **`cn(...inputs: ClassValue[])`** : Fusionne dynamiquement les classes Tailwind CSS en résolvant les conflits avec `clsx` et `tailwind-merge`.
