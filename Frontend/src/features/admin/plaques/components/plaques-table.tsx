"use client";

import { Edit, MoreHorizontal, Trash2, User } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicule } from "@/types/models";

interface PlaquesTableProps {
  data: Vehicule[];
  isLoading: boolean;
  isSupervision: boolean;
  onEdit: (vehicule: Vehicule) => void;
  onDelete: (vehicule: Vehicule) => void;
}

/**
 * Composant de tableau dédié à l'affichage de la flotte d'immatriculations (PlaquesTable).
 */
export function PlaquesTable({
  data,
  isLoading,
  isSupervision,
  onEdit,
  onDelete,
}: PlaquesTableProps) {
  const columns = [
    {
      key: "numero_plaque",
      header: "Plaque d'Immatriculation",
      sortable: true,
      accessor: (row: Vehicule) => (
        <span className="font-bold text-foreground font-brand text-base tracking-wide">
          {row.numero_plaque}
        </span>
      ),
    },
    {
      key: "personnel",
      header: "Propriétaire Rattaché",
      accessor: (row: Vehicule) =>
        row.personnel?.utilisateur ? (
          <div className="flex items-center gap-2">
            <User className="size-3.5 text-muted-foreground" />
            <div>
              <div className="font-semibold text-xs text-foreground">
                {row.personnel.utilisateur.prenom}{" "}
                {row.personnel.utilisateur.nom}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {row.personnel.utilisateur.matricule} · {row.personnel.fonction}
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
      key: "marque_modele",
      header: "Marque & Modèle",
      sortable: true,
      accessor: (row: Vehicule) => row.marque_modele || "Non spécifié",
    },
    {
      key: "couleur",
      header: "Couleur",
      accessor: (row: Vehicule) => (
        <span className="text-xs text-muted-foreground font-medium">
          {row.couleur || "Indéterminée"}
        </span>
      ),
    },
    {
      key: "type_vehicule",
      header: "Catégorie",
      sortable: true,
      accessor: (row: Vehicule) => (
        <Badge variant={row.type_vehicule === "personnel" ? "default" : "gold"}>
          {row.type_vehicule === "personnel" ? "Personnel BCRG" : "Visiteur"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: Vehicule) =>
        !isSupervision ? (
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
              <DropdownMenuLabel>Actions Véhicule</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Edit className="size-4 text-muted-foreground" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(row)}
              >
                <Trash2 className="size-4" />
                Retirer de la flotte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            Lecture seule
          </span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="Aucun véhicule ne correspond aux critères de recherche."
    />
  );
}
