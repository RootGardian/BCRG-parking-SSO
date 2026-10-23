"use client";

import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  User,
  X,
} from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MouvementItem } from "../types";

interface PersonnelSurSiteTableProps {
  data: MouvementItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading: boolean;
  searchFilter: string;
  onSearchChange: (q: string) => void;
  statutFilter: string;
  onStatutChange: (statut: string) => void;
  dateDebut: string;
  onDateDebutChange: (d: string) => void;
  dateFin: string;
  onDateFinChange: (d: string) => void;
  onResetFilters: () => void;
  onRequestSortie: (mouvement: MouvementItem) => void;
}

function formatDateSeule(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function formatHeureSeule(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Tableau réactif des mouvements du personnel BCRG avec barre de filtres complète et pagination (PersonnelSurSiteTable).
 */
export function PersonnelSurSiteTable({
  data,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  searchFilter,
  onSearchChange,
  statutFilter,
  onStatutChange,
  dateDebut,
  onDateDebutChange,
  dateFin,
  onDateFinChange,
  onResetFilters,
  onRequestSortie,
}: PersonnelSurSiteTableProps) {
  const hasActiveFilters =
    searchFilter.trim() !== "" ||
    statutFilter !== "all" ||
    dateDebut !== "" ||
    dateFin !== "";

  const columns = [
    {
      key: "matricule",
      header: "Occupant",
      accessor: (row: MouvementItem) => {
        const userObj = row.vehicule?.personnel?.utilisateur;
        return (
          <div className="flex items-center gap-2">
            <User className="size-4 text-brand-green-700 shrink-0" />
            <div>
              <div className="font-bold text-xs text-foreground font-brand">
                {userObj
                  ? `${userObj.prenom} ${userObj.nom}`
                  : "Personnel BCRG"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Matricule : {userObj?.matricule || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "vehicule",
      header: "Immatriculation",
      accessor: (row: MouvementItem) => (
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
            {row.vehicule?.numero_plaque || "SANS-VEHICULE"}
          </span>
          {row.vehicule?.marque_modele && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {row.vehicule.marque_modele}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      accessor: (row: MouvementItem) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatDateSeule(row.heure_arrivee)}
        </span>
      ),
    },
    {
      key: "heure_arrivee",
      header: "Entrée À",
      accessor: (row: MouvementItem) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatHeureSeule(row.heure_arrivee)}
        </span>
      ),
    },
    {
      key: "heure_depart",
      header: "Sortie À",
      accessor: (row: MouvementItem) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatHeureSeule(row.heure_depart)}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      accessor: (row: MouvementItem) => (
        <Badge variant={row.statut === "sur_site" ? "success" : "outline"}>
          {row.statut === "sur_site" ? "Sur site" : "Hors site"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Action Guichet",
      align: "right" as const,
      accessor: (row: MouvementItem) =>
        row.statut === "sur_site" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1 text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-300"
            onClick={() => onRequestSortie(row)}
          >
            <ArrowUpRight className="size-3.5" />
            Sortie
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Barre de filtrage multi-critères */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
        {/* Recherche par mot-clé */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par matricule, nom ou immatriculation..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-green-700"
          />
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          {searchFilter && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filtres multi-critères */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Statut */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
              <Filter className="size-3.5 text-muted-foreground shrink-0" />
              Statut :
            </span>
            <div className="relative">
              <select
                value={statutFilter}
                onChange={(e) => onStatutChange(e.target.value)}
                className="h-9 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-green-700"
              >
                <option value="all">Tous les statuts</option>
                <option value="sur_site">Présents sur site</option>
                <option value="hors_site">Hors site</option>
              </select>
              <ChevronDown className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Date Début */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              Du :
            </span>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => onDateDebutChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-green-700"
            />
          </div>

          {/* Date Fin */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">
              Au :
            </span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => onDateFinChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-green-700"
            />
          </div>

          {/* Réinitialiser les filtres */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 border-border"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="size-3.5" />
              <span>Réinitialiser</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground font-brand">
          Registre des Mouvements du Personnel ({totalItems})
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Aucun mouvement de personnel ne correspond aux critères recherchés."
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
