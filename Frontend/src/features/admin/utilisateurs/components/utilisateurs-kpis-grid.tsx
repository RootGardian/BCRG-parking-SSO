"use client";

import { Eye, Shield, Users } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { Utilisateur } from "@/types/models";

interface UtilisateursKPIsGridProps {
  data: Utilisateur[];
  total: number;
  isLoading: boolean;
}

/**
 * Grille KPI réactive des comptes utilisateurs avec Skeletons de chargement (UtilisateursKPIsGrid).
 */
export function UtilisateursKPIsGrid({
  data,
  total,
  isLoading,
}: UtilisateursKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="destructive" />
        <KPICardSkeleton variant="gold" />
        <KPICardSkeleton variant="blue" />
      </KPICardsGrid>
    );
  }

  const countAdmins = data.filter((u) => u.role === "admin").length;
  const countSupervision = data.filter((u) => u.role === "supervision").length;
  const countAgents = data.filter((u) => u.role === "agent").length;

  return (
    <KPICardsGrid columns={4}>
      <KPICard
        title="Comptes Utilisateurs"
        value={total}
        icon={Users}
        variant="emerald"
      />
      <KPICard
        title="Administrateurs"
        value={countAdmins}
        icon={Shield}
        variant="blue"
      />
      <KPICard
        title="Supervision"
        value={countSupervision}
        icon={Eye}
        variant="gold"
      />
      <KPICard
        title="Agents de Sécurité"
        value={countAgents}
        icon={Users}
        variant="amber"
      />
    </KPICardsGrid>
  );
}
