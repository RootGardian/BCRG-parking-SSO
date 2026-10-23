import { ArrowDownRight, ArrowUpRight, Car, Percent } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { OccupancyStats } from "../types";

/**
 * Interface des props du composant OccupancyKPIsGrid.
 */
interface OccupancyKPIsGridProps {
  stats?: OccupancyStats;
  isLoading?: boolean;
}

/**
 * Composant d'affichage de la grille des cartes KPI d'occupation du parking.
 *
 * @param props Props du composant {@link OccupancyKPIsGridProps}
 * @returns La grille de 4 cartes d'indicateurs chiffrés
 */
export function OccupancyKPIsGrid({
  stats,
  isLoading,
}: OccupancyKPIsGridProps) {
  if (isLoading || !stats) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="amber" />
        <KPICardSkeleton variant="gold" />
      </KPICardsGrid>
    );
  }

  return (
    <KPICardsGrid columns={4}>
      <KPICard
        title="Présents sur Site"
        value={`${stats.vehiculesSurSite} / ${stats.capaciteTotale}`}
        description="Véhicules actuellement garés"
        icon={Car}
        variant="emerald"
        trend={{ value: "En temps réel", isPositive: true }}
      />
      <KPICard
        title="Entrées du Jour"
        value={stats.entreesAujourdhui}
        description="Cumul des entrées enregistrées"
        icon={ArrowDownRight}
        variant="blue"
        trend={{ value: "Aujourd'hui", isPositive: true }}
      />
      <KPICard
        title="Sorties du Jour"
        value={stats.sortiesAujourdhui}
        description="Cumul des départs libérés"
        icon={ArrowUpRight}
        variant="amber"
      />
      <KPICard
        title="Taux d'Occupation"
        value={`${stats.tauxOccupation}%`}
        description={`Capacité sous-sol saturée à ${stats.tauxOccupation}%`}
        icon={Percent}
        variant={stats.tauxOccupation > 85 ? "rose" : "gold"}
        trend={{
          value:
            stats.tauxOccupation > 85 ? "Presque Plein" : "Capacité Normale",
          isPositive: stats.tauxOccupation <= 85,
        }}
      />
    </KPICardsGrid>
  );
}
