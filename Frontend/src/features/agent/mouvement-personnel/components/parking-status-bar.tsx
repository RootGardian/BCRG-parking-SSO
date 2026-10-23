"use client";

import { Activity, Building2, CheckCircle2 } from "lucide-react";
import { KPICard, KPICardsGrid } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils";
import type { ParkingStatus } from "../types";

interface ParkingStatusBarProps {
  status: ParkingStatus;
  isLoading?: boolean;
}

/**
 * Bandeau haut de page du guichet vigile alimenté par l'endpoint /api/v1/parking/statut.
 *
 * Sur mobile et tablette : s'affiche sous forme d'une micro-barre compacte (40px)
 * pour éviter de repousser le bouton de scan sous la ligne de flottaison.
 * Sur grand écran (Desktop) : affiche les 3 cartes KPI analytiques complètes.
 */
export function ParkingStatusBar({
  status,
  isLoading = false,
}: ParkingStatusBarProps) {
  const isStatusLoading = isLoading || status.capacite_max === 0;

  const placesLibres = Math.max(
    0,
    status.capacite_max - status.presents_sur_site,
  );

  const subtitlePresents =
    status.personnel || status.visiteurs
      ? `Personnel: ${status.personnel?.occupees ?? 0} | Visiteurs: ${status.visiteurs?.occupees ?? 0}`
      : "Véhicules actuellement stationnés";

  const subtitleLibres =
    status.personnel || status.visiteurs
      ? `Personnel: ${status.personnel?.disponibles ?? 0} | Visiteurs: ${status.visiteurs?.disponibles ?? 0}`
      : `Sur un total de ${status.capacite_max} emplacements`;

  const isFull = status.taux_occupation >= 100;
  const isCrowded = status.taux_occupation > 80;

  return (
    <div className="w-full">
      {/* 1. Vue Mobile & Tablette : Micro-barre d'état compacte haute densité (44px) */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 px-3.5 shadow-xs text-xs lg:hidden">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2.5 rounded-full shrink-0",
              isFull
                ? "bg-brand-red-700"
                : isCrowded
                  ? "bg-brand-orange-500"
                  : "bg-emerald-500 animate-pulse",
            )}
          />
          <span className="text-muted-foreground font-medium">
            Places libres :
          </span>
          <span className="font-bold font-mono text-foreground text-sm">
            {isStatusLoading ? "..." : placesLibres}
          </span>
          <span className="text-muted-foreground font-mono text-[11px]">
            {isStatusLoading ? "" : `/ ${status.capacite_max}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Sur site :</span>
          <span className="font-bold font-mono text-foreground">
            {isStatusLoading ? "..." : status.presents_sur_site}
          </span>
          {!isStatusLoading && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border",
                isFull
                  ? "bg-brand-red-700/10 text-brand-red-700 border-brand-red-700/20"
                  : isCrowded
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-secondary text-muted-foreground border-border",
              )}
            >
              {status.taux_occupation}%
            </span>
          )}
        </div>
      </div>

      {/* 2. Vue Grand Écran Desktop : Grille KPI analytique à 3 colonnes */}
      <div className="hidden lg:block">
        <KPICardsGrid columns={3}>
          <KPICard
            title="Présents Sur Site"
            value={status.presents_sur_site}
            subtitle={subtitlePresents}
            variant="blue"
            icon={Activity}
            isLoading={isStatusLoading}
          />

          <KPICard
            title="Places Disponibles"
            value={placesLibres}
            subtitle={subtitleLibres}
            variant="success"
            icon={CheckCircle2}
            isLoading={isStatusLoading}
          />

          <KPICard
            title="Taux d'Occupation"
            value={`${status.taux_occupation}%`}
            subtitle={
              isFull
                ? "Parking complet"
                : `${status.presents_sur_site} place(s) occupée(s) sur ${status.capacite_max}`
            }
            variant={isFull ? "destructive" : isCrowded ? "amber" : "gold"}
            icon={Building2}
            isLoading={isStatusLoading}
          />
        </KPICardsGrid>
      </div>
    </div>
  );
}
