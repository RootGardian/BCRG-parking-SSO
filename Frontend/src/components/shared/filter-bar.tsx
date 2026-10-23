"use client";

import { Filter, RotateCcw, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

/**
 * Interface décrivant les propriétés du composant FilterBar.
 */
export interface FilterBarProps {
  /** Valeur actuelle du champ de recherche textuel */
  searchValue?: string;
  /** Valeur de recherche textuelle (alias de searchValue) */
  searchQuery?: string;
  /** Callback déclenché lors de la modification de la recherche */
  onSearchChange: (value: string) => void;
  /** Texte indicatif (placeholder) affiché dans le champ de recherche */
  searchPlaceholder?: string;
  /** Options de filtrage rapide par liste déroulante */
  filterOptions?: FilterOption[];
  /** Option de filtre rapide actuellement sélectionnée */
  selectedFilter?: string;
  /** Callback lors du changement de filtre rapide */
  onFilterChange?: (val: string) => void;
  /** Callback ouvrant la modal de filtres avancés */
  onOpenFilterModal?: () => void;
  /** Nombre de filtres avancés actuellement appliqués */
  activeFiltersCount?: number;
  /** Callback réinitialisant tous les filtres actifs */
  onResetFilters?: () => void;
  /** Composants ou boutons d'actions supplémentaires */
  extraActions?: React.ReactNode;
}

/**
 * Composant de barre de recherche rapide et déclencheur de filtres (FilterBar).
 *
 * @param props Props du composant FilterBar {@link FilterBarProps}
 * @returns La barre de filtres et recherche réutilisable
 */
export function FilterBar({
  searchValue,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Rechercher par plaque, nom, matricule...",
  filterOptions,
  selectedFilter,
  onFilterChange,
  onOpenFilterModal,
  activeFiltersCount = 0,
  onResetFilters,
  extraActions,
}: FilterBarProps) {
  const currentSearch =
    searchQuery !== undefined ? searchQuery : searchValue || "";

  // État local pour réactivité immédiate de l'input et debounce vers onSearchChange
  const [localSearch, setLocalSearch] = React.useState(currentSearch);

  // Synchronisation avec la prop parente en cas de reset ou de modification externe
  React.useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  // Debounce 300ms avant notification du parent
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentSearch) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, currentSearch, onSearchChange]);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
      {/* Barre de recherche textuelle rapide avec debounce */}
      <div className="relative flex-1 min-w-0">
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={searchPlaceholder}
          leftIcon={<Search className="size-4" />}
          rightIcon={
            localSearch ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Effacer la recherche"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Sélecteur de Filtre Rapide & Boutons Avancés */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {filterOptions && onFilterChange && (
          <div className="w-48 sm:w-56">
            <Select
              options={filterOptions}
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value)}
            />
          </div>
        )}

        {onOpenFilterModal && (
          <Button
            variant="outline"
            onClick={onOpenFilterModal}
            className="relative gap-2"
          >
            <Filter className="size-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}

        {activeFiltersCount > 0 && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">Réinitialiser</span>
          </Button>
        )}

        {extraActions}
      </div>
    </div>
  );
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  title = "Filtres Avancés",
}: FilterModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Appliquez des critères de filtrage multicritères sur la liste."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" />
            <span>Réinitialiser</span>
          </Button>
          <Button onClick={onApply}>Appliquer les filtres</Button>
        </>
      }
    >
      <div className="space-y-4 py-2">{children}</div>
    </Dialog>
  );
}
