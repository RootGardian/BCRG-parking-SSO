"use client";

import { Activity, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";
import {
  KPICard,
  KPICardSkeleton,
  KPICardsGrid,
} from "@/components/shared/kpi-card";
import type { AuditLog } from "../types";

interface AuditKPIsGridProps {
  data: AuditLog[];
  total: number;
  isLoading: boolean;
}

/**
 * Grille des 4 indicateurs clés d'activité et de sécurité du journal d'audit.
 */
export function AuditKPIsGrid({ data, total, isLoading }: AuditKPIsGridProps) {
  if (isLoading) {
    return (
      <KPICardsGrid columns={4}>
        <KPICardSkeleton variant="emerald" />
        <KPICardSkeleton variant="blue" />
        <KPICardSkeleton variant="gold" />
        <KPICardSkeleton variant="amber" />
      </KPICardsGrid>
    );
  }

  // Calcul défensif des métriques à partir des données
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const actionsToday = Array.isArray(data)
    ? data.filter((l) =>
        Boolean(l?.date_action && String(l.date_action).startsWith(todayStr)),
      ).length
    : 0;

  const uniqueOperators = Array.isArray(data)
    ? new Set(data.map((l) => l?.utilisateur?.matricule).filter(Boolean)).size
    : 0;

  const sensitiveActions = Array.isArray(data)
    ? data.filter((l) => {
        const act = String(l?.action || "").toUpperCase();
        return (
          act.includes("DELETE") ||
          act.includes("SUSPEND") ||
          act.includes("RESET_PASSWORD") ||
          act.includes("SUPPR")
        );
      }).length
    : 0;

  return (
    <KPICardsGrid columns={4}>
      <KPICard
        title="Total des Événements"
        value={total}
        subtitle="Historique consigné"
        icon={ShieldCheck}
        variant="emerald"
      />
      <KPICard
        title="Activité Récente (24h)"
        value={actionsToday}
        subtitle="Opérations aujourd'hui"
        icon={Activity}
        variant="blue"
      />
      <KPICard
        title="Opérateurs Actifs"
        value={uniqueOperators}
        subtitle="Administrateurs uniques"
        icon={UserCheck}
        variant="gold"
      />
      <KPICard
        title="Actions Sensibles"
        value={sensitiveActions}
        subtitle="Suppressions & Sécurité"
        icon={AlertTriangle}
        variant="amber"
      />
    </KPICardsGrid>
  );
}
