"use client";

import { Download, Plus, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { personnelService } from "../services/personnel.service";

interface PersonnelHeaderProps {
  isSupervision: boolean;
  onOpenCreateModal: () => void;
  onExportQRCodesZip: () => void;
  onExportReport: () => void;
  onImportSuccess: () => void;
}

/**
 * En-tête de section dédié au Personnel (PersonnelHeader).
 */
export function PersonnelHeader({
  isSupervision,
  onOpenCreateModal,
  onExportQRCodesZip,
  onExportReport,
  onImportSuccess,
}: PersonnelHeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Veuillez sélectionner un fichier au format .csv");
      return;
    }

    setIsImporting(true);
    try {
      const res = await personnelService.importCsv(file);
      toast.success(res.message);
      onImportSuccess();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors de l'importation du fichier CSV du personnel.",
        ),
      );
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      <PageHeader
        title="Gestion du Personnel BCRG"
        description="Répertoire institutionnel, attribution des fonctions, badges QR Code et véhicules autorisés au parking."
        action={
          !isSupervision ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-border hover:bg-accent"
                onClick={onExportQRCodesZip}
              >
                <Download className="size-4 text-brand-green-700" />
                Exporter QR Codes (ZIP)
              </Button>

              <Button
                type="button"
                variant="outline"
                isLoading={isImporting}
                onClick={handleImportClick}
                className="gap-2 border-border hover:bg-accent"
              >
                <Upload className="size-4 text-brand-green-700" />
                Importer CSV
              </Button>

              <Button
                type="button"
                variant="default"
                onClick={onOpenCreateModal}
                className="gap-2"
              >
                <Plus className="size-4" />
                Ajouter un personnel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={onExportReport}
              className="gap-2"
            >
              Imprimer / Exporter le rapport
            </Button>
          )
        }
      />
    </>
  );
}
