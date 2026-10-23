"use client";

import { Award, Building2, CheckCircle2, Users } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlaceParkingItem } from "../types";

interface ParkingKPIsGridProps {
  places: PlaceParkingItem[];
  isLoading: boolean;
}

/**
 * Grille d'indicateurs KPIs pour la gestion du parking et des fonctions BCRG.
 * Calibrée selon les standards visuels des tableaux de bord institutionnels.
 */
export function ParkingKPIsGrid({ places, isLoading }: ParkingKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="amber" />
        <KPICardSkeleton variant="gold" />
      </KPICardsGrid>
    );
  }

  const totalPlaces = places.length;
  const countVisiteurs = places.filter((p) => p.est_visiteur).length;
  const countFonctions = totalPlaces - countVisiteurs;
  const countOccupees = places.filter((p) => p.est_occupee).length;
  const countLibres = Math.max(0, totalPlaces - countOccupees);
  const tauxOccupation =
    totalPlaces > 0 ? Math.round((countOccupees / totalPlaces) * 100) : 0;

  return (
    <KPICardsGrid columns={4}>
      {/* 1. Capacité Totale */}
      <KPICard
        title="Capacité Totale"
        value={totalPlaces}
        subtitle="Emplacements sous-sol inventoriés"
        icon={Building2}
        variant="emerald"
      />

      {/* 2. Places Fonctions */}
      <KPICard
        title="Places Attribuées (Fonctions)"
        value={countFonctions}
        subtitle={
          totalPlaces > 0
            ? `${Math.round((countFonctions / totalPlaces) * 100)}% de la capacité totale`
            : "Réservées par fonction"
        }
        icon={Award}
        variant="blue"
      />

      {/* 3. Places Visiteurs */}
      <KPICard
        title="Places Réservées Visiteurs"
        value={countVisiteurs}
        subtitle={
          totalPlaces > 0
            ? `${Math.round((countVisiteurs / totalPlaces) * 100)}% de la capacité totale`
            : "Réservées aux visiteurs externes"
        }
        icon={Users}
        variant="gold"
      />

      {/* 4. Occupation Actuelle & Jauge Dynamique */}
      <Card className="relative overflow-hidden shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Occupation Actuelle
            </span>
            <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
              <CheckCircle2 className="size-5 text-amber-600" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-brand tracking-tight text-foreground">
              {countOccupees}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {totalPlaces}
              </span>
            </span>

            <div
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                tauxOccupation > 80
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              <span>{tauxOccupation}%</span>
            </div>
          </div>

          {/* Micro barre de progression et état des places */}
          <div className="mt-2.5 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  tauxOccupation > 80
                    ? "bg-brand-red-700"
                    : tauxOccupation > 50
                      ? "bg-amber-500"
                      : "bg-brand-green-700",
                )}
                style={{ width: `${Math.min(100, tauxOccupation)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-600 inline-block" />
                {countLibres} libre{countLibres > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="size-1.5 rounded-full bg-amber-600 inline-block" />
                {countOccupees} occupée{countOccupees > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </KPICardsGrid>
  );
}
