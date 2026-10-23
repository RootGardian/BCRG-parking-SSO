"use client";

import { Eye, FileEdit, MoreHorizontal, User } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MouvementItem } from "../types";

interface MouvementsTableProps {
  data: MouvementItem[];
  isLoading: boolean;
  isSupervision: boolean;
  onViewDetail: (mouvement: MouvementItem) => void;
  onCorrection: (mouvement: MouvementItem) => void;
}

/**
 * Formate une date ISO en chaîne lisible en français.
 */
function formatDateHeure(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Formate une durée en minutes en heures et minutes.
 */
function formatDuree(minutes?: number): string {
  if (minutes === undefined || minutes === null) return "En cours...";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}min`;
  return `${mins} min`;
}

/**
 * Composant de tableau pour l'historique des mouvements au parking (MouvementsTable).
 */
export function MouvementsTable({
  data,
  isLoading,
  isSupervision,
  onViewDetail,
  onCorrection,
}: MouvementsTableProps) {
  const columns = [
    {
      key: "heure_arrivee",
      header: "Heure d'Entrée",
      sortable: true,
      accessor: (row: MouvementItem) => (
        <div className="font-semibold text-xs text-foreground">
          {formatDateHeure(row.heure_arrivee)}
        </div>
      ),
    },
    {
      key: "heure_depart",
      header: "Heure de Sortie",
      sortable: true,
      accessor: (row: MouvementItem) =>
        row.heure_depart ? (
          <div className="text-xs text-muted-foreground">
            {formatDateHeure(row.heure_depart)}
          </div>
        ) : (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            En cours d&apos;occupation
          </span>
        ),
    },
    {
      key: "duree",
      header: "Durée",
      accessor: (row: MouvementItem) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDuree(row.duree_minutes)}
        </span>
      ),
    },
    {
      key: "vehicule",
      header: "Plaque & Véhicule",
      sortable: true,
      accessor: (row: MouvementItem) => (
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
            {row.vehicule?.numero_plaque || "IMMAT-INCONNUE"}
          </span>
          {row.vehicule?.marque_modele && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {row.vehicule.marque_modele}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "proprietaire",
      header: "Occupant",
      accessor: (row: MouvementItem) =>
        row.vehicule?.personnel?.utilisateur ? (
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-brand-green-700" />
            <div>
              <div className="font-bold text-xs text-foreground font-brand">
                {row.vehicule.personnel.utilisateur.prenom}{" "}
                {row.vehicule.personnel.utilisateur.nom}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Matricule: {row.vehicule.personnel.utilisateur.matricule}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Visiteur Externe
          </span>
        ),
    },
    {
      key: "type_entree",
      header: "Catégorie",
      accessor: (row: MouvementItem) => (
        <Badge variant={row.type_entree === "personnel" ? "default" : "gold"}>
          {row.type_entree === "personnel" ? "Personnel BCRG" : "Visiteur"}
        </Badge>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      accessor: (row: MouvementItem) => (
        <Badge variant={row.statut === "sur_site" ? "success" : "secondary"}>
          {row.statut === "sur_site" ? "Sur site" : "Hors site"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: MouvementItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right">
            <DropdownMenuLabel>Option du Passage</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetail(row)}>
              <Eye className="size-4 text-blue-600" />
              Consulter la fiche
            </DropdownMenuItem>
            {!isSupervision && (
              <DropdownMenuItem onClick={() => onCorrection(row)}>
                <FileEdit className="size-4 text-amber-600" />
                Rectifier / Annoter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="Aucun mouvement de véhicule enregistré dans cette période."
    />
  );
}
