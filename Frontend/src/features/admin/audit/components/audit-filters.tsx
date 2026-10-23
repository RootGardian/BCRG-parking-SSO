"use client";

import { FilterBar } from "@/components/shared/filter-bar";
import type { AuditActionCategory } from "../types";

interface AuditFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: AuditActionCategory;
  onCategoryChange: (category: string) => void;
}

const CATEGORY_OPTIONS = [
  { label: "Toutes les catégories", value: "all" },
  { label: "Créations & Imports", value: "creation" },
  { label: "Modifications", value: "modification" },
  { label: "Sécurité & Accès", value: "securite" },
  { label: "Suppressions & Suspensions", value: "suppression" },
];

/**
 * Composant de filtrage et recherche pour le Journal d'Audit.
 */
export function AuditFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: AuditFiltersProps) {
  return (
    <FilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Rechercher par action, cible, détails ou opérateur..."
      filterOptions={CATEGORY_OPTIONS}
      selectedFilter={selectedCategory}
      onFilterChange={onCategoryChange}
    />
  );
}
