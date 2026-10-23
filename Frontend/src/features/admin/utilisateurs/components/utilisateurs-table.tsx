"use client";

import {
  Building2,
  Edit,
  KeyRound,
  MoreHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";
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
import { StatusBadge } from "@/components/ui/status-badge";
import type { ParkingItem } from "@/features/admin/parking/types";
import type { Utilisateur } from "@/types/models";

interface UtilisateursTableProps {
  data: Utilisateur[];
  parkings?: ParkingItem[];
  isLoading: boolean;
  isSupervision: boolean;
  onEdit: (user: Utilisateur) => void;
  onResetPassword: (user: Utilisateur) => void;
  onToggleStatus: (user: Utilisateur) => void;
}

/**
 * Composant de tableau dédié à l'affichage des utilisateurs (UtilisateursTable).
 */
export function UtilisateursTable({
  data,
  parkings = [],
  isLoading,
  isSupervision,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: UtilisateursTableProps) {
  const columns = [
    {
      key: "utilisateur",
      header: "Nom & Prénom",
      sortable: true,
      accessor: (row: Utilisateur) => (
        <div>
          <div className="font-bold text-foreground font-brand text-sm">
            {row.prenom} {row.nom}
          </div>
          {row.fonction && (
            <div className="text-xs text-muted-foreground font-medium">
              {row.fonction}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "matricule",
      header: "Matricule",
      sortable: true,
      accessor: (row: Utilisateur) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
          {row.matricule}
        </span>
      ),
    },
    {
      key: "role",
      header: "Rôle / Profil",
      sortable: true,
      accessor: (row: Utilisateur) => (
        <StatusBadge type="role" value={row.role} />
      ),
    },
    {
      key: "parking",
      header: "Parking Assigné",
      accessor: (row: Utilisateur) => {
        if (row.role !== "agent") {
          return (
            <span className="text-xs text-muted-foreground italic">—</span>
          );
        }

        const assignedId =
          row.id_parking !== undefined && row.id_parking !== null
            ? row.id_parking
            : row.agent?.id_parking !== undefined &&
                row.agent.id_parking !== null
              ? row.agent.id_parking
              : undefined;

        const parkingName =
          row.parking_nom ||
          (assignedId ? parkings.find((p) => p.id === assignedId)?.nom : null);

        if (parkingName) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-green-700/10 text-brand-green-700 border border-brand-green-700/20">
              <Building2 className="size-3.5 shrink-0" />
              <span>{parkingName}</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
            Non assigné
          </span>
        );
      },
    },
    {
      key: "est_actif",
      header: "Statut du Compte",
      accessor: (row: Utilisateur) => (
        <Badge variant={row.est_actif ? "success" : "destructive"}>
          {row.est_actif ? "Actif" : "Suspendu"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: Utilisateur) =>
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
              <DropdownMenuLabel>Gestion du Compte</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Edit className="size-4 text-muted-foreground" />
                Modifier le profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(row)}>
                <KeyRound className="size-4 text-amber-600" />
                Réinitialiser le mot de passe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={
                  row.est_actif ? "text-destructive" : "text-emerald-600"
                }
                onClick={() => onToggleStatus(row)}
              >
                {row.est_actif ? (
                  <>
                    <UserX className="size-4" />
                    Suspendre le compte
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4" />
                    Réactiver le compte
                  </>
                )}
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
      emptyMessage="Aucun utilisateur ne correspond aux critères de recherche."
    />
  );
}
