"use client";

import { Car, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

interface PlaquesHeaderProps {
  isSupervision: boolean;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  onExportReport: () => void;
}

/**
 * En-tête dédié à la section Flotte Automobile (PlaquesHeader).
 */
export function PlaquesHeader({
  isSupervision,
  onOpenCreateModal,
  onOpenImportModal,
  onExportReport,
}: PlaquesHeaderProps) {
  return (
    <PageHeader
      title="Gestion de la Flotte Automobile"
      description="Répertoire des immatriculations enregistrées et autorisées dans l'enceinte de la Banque Centrale."
      action={
        !isSupervision ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onOpenImportModal}>
              <Upload className="size-4" />
              Importer CSV
            </Button>
            <Button variant="default" onClick={onOpenCreateModal}>
              <Car className="size-4" />+ Ajouter un véhicule
            </Button>
          </div>
        ) : (
          <Button variant="gold" onClick={onExportReport}>
            <Download className="size-4" />
            Exporter la flotte (PDF)
          </Button>
        )
      }
    />
  );
}
