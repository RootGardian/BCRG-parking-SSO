"use client";

import { Edit, MoreHorizontal, QrCode, UserX } from "lucide-react";
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
import type { PersonnelItem } from "../types";

interface PersonnelTableProps {
  data: PersonnelItem[];
  isLoading: boolean;
  isSupervision: boolean;
  onEdit: (personnel: PersonnelItem) => void;
  onViewQrCode: (personnel: PersonnelItem) => void;
  onDelete: (personnel: PersonnelItem) => void;
}

/**
 * Composant de tableau réutilisable pour la Gestion du Personnel (PersonnelTable).
 */
export function PersonnelTable({
  data,
  isLoading,
  isSupervision,
  onEdit,
  onViewQrCode,
  onDelete,
}: PersonnelTableProps) {
  const columns = [
    {
      key: "nom_prenom",
      header: "Nom & Prénom",
      sortable: true,
      accessor: (row: PersonnelItem) => (
        <div className="font-bold text-foreground font-brand text-sm">
          {row.prenom} {row.nom}
        </div>
      ),
    },
    {
      key: "matricule",
      header: "Matricule",
      sortable: true,
      accessor: (row: PersonnelItem) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
          {row.matricule}
        </span>
      ),
    },
    {
      key: "fonction",
      header: "Fonction",
      sortable: true,
      accessor: (row: PersonnelItem) => (
        <Badge
          variant="outline"
          className="font-medium text-xs border-brand-green-700/30 text-brand-green-700 bg-brand-green-500/10"
        >
          {row.fonction || "Employé BCRG"}
        </Badge>
      ),
    },
    {
      key: "vehicules",
      header: "Véhicules Rattachés",
      accessor: (row: PersonnelItem) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {row.vehicules && row.vehicules.length > 0 ? (
            row.vehicules.map((v) => (
              <span
                key={v.id}
                className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {v.numero_plaque}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Aucun véhicule
            </span>
          )}
        </div>
      ),
    },
    {
      key: "qrcode",
      header: "Badge QR Code",
      accessor: (row: PersonnelItem) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs border-border"
          onClick={() => onViewQrCode(row)}
        >
          <QrCode className="size-3.5 text-brand-green-700" />
          Afficher QR
        </Button>
      ),
    },
    {
      key: "est_actif",
      header: "Statut",
      accessor: (row: PersonnelItem) => (
        <Badge variant={row.est_actif ? "success" : "destructive"}>
          {row.est_actif ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: PersonnelItem) =>
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
              <DropdownMenuLabel>Gestion du Personnel</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Edit className="size-4 text-muted-foreground" />
                Modifier les infos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewQrCode(row)}>
                <QrCode className="size-4 text-blue-600" />
                Télécharger QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(row)}
              >
                <UserX className="size-4" />
                Désactiver le compte
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
      emptyMessage="Aucun membre du personnel ne correspond aux critères."
    />
  );
}
