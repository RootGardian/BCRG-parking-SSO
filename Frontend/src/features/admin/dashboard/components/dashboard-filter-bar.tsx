"use client";

import { Calendar, Clock, Filter, RotateCcw } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface DashboardFilterBarProps {
  dateDebut: string;
  dateFin: string;
  onDateRangeChange: (debut?: string, fin?: string) => void;
}

/**
 * Composant de filtrage par plage de dates pour le Tableau de Bord Administration & Supervision.
 */
export function DashboardFilterBar({
  dateDebut,
  dateFin,
  onDateRangeChange,
}: DashboardFilterBarProps) {
  const [localDebut, setLocalDebut] = React.useState(dateDebut);
  const [localFin, setLocalFin] = React.useState(dateFin);

  React.useEffect(() => {
    setLocalDebut(dateDebut);
    setLocalFin(dateFin);
  }, [dateDebut, dateFin]);

  const handleApply = () => {
    onDateRangeChange(localDebut, localFin);
  };

  const handleReset = () => {
    setLocalDebut("");
    setLocalFin("");
    onDateRangeChange("", "");
  };

  const setPresetToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setLocalDebut(today);
    setLocalFin(today);
    onDateRangeChange(today, today);
  };

  const setPresetLast7Days = () => {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 7);
    const debutStr = last7.toISOString().slice(0, 10);
    const finStr = today.toISOString().slice(0, 10);
    setLocalDebut(debutStr);
    setLocalFin(finStr);
    onDateRangeChange(debutStr, finStr);
  };

  const setPresetThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const debutStr = firstDay.toISOString().slice(0, 10);
    const finStr = today.toISOString().slice(0, 10);
    setLocalDebut(debutStr);
    setLocalFin(finStr);
    onDateRangeChange(debutStr, finStr);
  };

  const hasFilter = Boolean(dateDebut || dateFin);

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-sm text-xs">
      {/* Sélecteurs de dates */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-bold text-foreground font-brand shrink-0">
          <Calendar className="size-4 text-brand-green-700 shrink-0" />
          <span>Filtrer par Période :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={localDebut}
            onChange={(e) => setLocalDebut(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-green-700 cursor-pointer"
          />
          <span className="text-muted-foreground font-medium">au</span>
          <input
            type="date"
            value={localFin}
            onChange={(e) => setLocalFin(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-base sm:text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-green-700 cursor-pointer"
          />

          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs px-3"
            onClick={handleApply}
          >
            <Filter className="size-3.5" />
            Appliquer
          </Button>

          {hasFilter && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="size-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Raccourcis Rapides */}
      <div className="flex flex-wrap items-center gap-1.5 border-t xl:border-t-0 xl:border-l border-border pt-2 xl:pt-0 xl:pl-3">
        <Clock className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
        <span className="text-muted-foreground text-[11px] hidden sm:block mr-1">
          Raccourcis :
        </span>

        <button
          type="button"
          onClick={setPresetToday}
          className="px-2.5 py-1 rounded-md bg-secondary hover:bg-accent text-foreground text-[11px] font-medium transition-colors cursor-pointer border border-border"
        >
          Aujourd&apos;hui
        </button>

        <button
          type="button"
          onClick={setPresetLast7Days}
          className="px-2.5 py-1 rounded-md bg-secondary hover:bg-accent text-foreground text-[11px] font-medium transition-colors cursor-pointer border border-border"
        >
          7 derniers jours
        </button>

        <button
          type="button"
          onClick={setPresetThisMonth}
          className="px-2.5 py-1 rounded-md bg-secondary hover:bg-accent text-foreground text-[11px] font-medium transition-colors cursor-pointer border border-border"
        >
          Ce mois
        </button>
      </div>
    </div>
  );
}
