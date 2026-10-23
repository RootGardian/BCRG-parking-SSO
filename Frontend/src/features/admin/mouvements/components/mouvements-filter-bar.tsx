"use client";

import { Calendar, Filter, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { MouvementFilterInput } from "../types";

interface MouvementsFilterBarProps {
  filters: MouvementFilterInput;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onStatutChange: (st: string) => void;
  onDateChange: (debut?: string, fin?: string) => void;
}

/**
 * Barre de filtrage avancée avec plage de dates pour l'historique des mouvements.
 */
export function MouvementsFilterBar({
  filters,
  onSearchChange,
  onCategoryChange,
  onStatutChange,
  onDateChange,
}: MouvementsFilterBarProps) {
  const [dateDebut, setDateDebut] = React.useState(filters.date_debut || "");
  const [dateFin, setDateFin] = React.useState(filters.date_fin || "");

  const handleApplyDates = () => {
    onDateChange(dateDebut, dateFin);
  };

  const handleClearDates = () => {
    setDateDebut("");
    setDateFin("");
    onDateChange("", "");
  };

  const hasDateFilter = Boolean(dateDebut || dateFin);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Recherche par plaque/nom */}
        <div className="relative flex-1">
          <Input
            value={filters.search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par plaque, modèle ou nom..."
            className="pl-9 pr-4 text-xs h-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="size-4" />
          </div>
        </div>

        {/* Filtres par Catégorie et Statut */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44">
            <Select
              options={[
                { label: "Toutes catégories", value: "all" },
                { label: "Personnel BCRG", value: "personnel" },
                { label: "Visiteurs", value: "visiteur" },
              ]}
              value={filters.type_entree || "all"}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
          </div>

          <div className="w-44">
            <Select
              options={[
                { label: "Tous les statuts", value: "all" },
                { label: "Présents (Sur site)", value: "sur_site" },
                { label: "Sortis (Hors site)", value: "hors_site" },
              ]}
              value={filters.statut || "all"}
              onChange={(e) => onStatutChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Barre de filtrage par date */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Calendar className="size-3.5 text-brand-green-700" />
          <span>Plage de Dates :</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green-700"
          />
          <span>au</span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green-700"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handleApplyDates}
          >
            <Filter className="size-3 text-brand-green-700" />
            Filtrer par date
          </Button>

          {hasDateFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearDates}
            >
              <X className="size-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
