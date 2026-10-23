"use client";

import { Eye, Shield } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "../types";

interface AuditTableProps {
  data: AuditLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditLog) => void;
}

/**
 * Retourne le style de badge adapté à l'action.
 */
function getActionBadgeStyle(action: string): string {
  if (action.startsWith("CREATE") || action.startsWith("IMPORT")) {
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  }
  if (action.startsWith("UPDATE") || action.startsWith("CORRECTION")) {
    return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  }
  if (
    action.includes("PASSWORD") ||
    action.includes("COMPTE") ||
    action.includes("AUTH")
  ) {
    return "bg-brand-yellow-500/15 text-amber-800 border-brand-yellow-500/30";
  }
  if (action.startsWith("DELETE") || action.startsWith("SUSPEND")) {
    return "bg-brand-red-700/10 text-brand-red-700 border-brand-red-700/20";
  }
  return "bg-secondary text-foreground border-border";
}

/**
 * Tableau d'affichage du journal d'audit administratif (AuditTable).
 */
export function AuditTable({
  data,
  isLoading,
  onViewDetails,
}: AuditTableProps) {
  const columns = [
    {
      key: "date_action",
      header: "Date & Heure",
      sortable: true,
      accessor: (row: AuditLog) => {
        const d = new Date(row.date_action);
        const isValidDate = !Number.isNaN(d.getTime());
        const dateStr = isValidDate
          ? d.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : row.date_action || "—";
        const timeStr = isValidDate
          ? d.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "";

        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground text-xs">
              {dateStr}
            </div>
            {timeStr ? (
              <div className="text-[11px] font-mono text-muted-foreground">
                {timeStr}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "utilisateur",
      header: "Opérateur (Auteur)",
      sortable: true,
      accessor: (row: AuditLog) => (
        <div className="space-y-0.5">
          <div className="font-bold text-foreground font-brand text-xs">
            {row.utilisateur?.nom || "Système BCRG"}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground font-medium">
            {row.utilisateur?.matricule || "SYSTEM"}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action Réalisée",
      sortable: true,
      accessor: (row: AuditLog) => {
        const badgeStyle = getActionBadgeStyle(row.action);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${badgeStyle}`}
          >
            <Shield className="size-3 shrink-0" />
            <span>{row.action}</span>
          </span>
        );
      },
    },
    {
      key: "cible",
      header: "Entité Cible",
      sortable: true,
      accessor: (row: AuditLog) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-secondary text-foreground border border-border">
          {row.cible}
        </span>
      ),
    },
    {
      key: "details",
      header: "Détails de l'Opération",
      accessor: (row: AuditLog) => (
        <p
          className="text-xs text-muted-foreground line-clamp-1 max-w-sm"
          title={row.details}
        >
          {row.details || "—"}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Détails",
      align: "right" as const,
      accessor: (row: AuditLog) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(row)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <Eye className="size-3.5" />
          <span className="hidden sm:inline">Consulter</span>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(l) => l.id}
      isLoading={isLoading}
      emptyMessage="Aucune entrée enregistrée dans le journal d'audit pour le moment."
    />
  );
}
