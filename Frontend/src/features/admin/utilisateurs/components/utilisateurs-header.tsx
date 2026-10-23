"use client";

import { Download, Upload, UserPlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { utilisateursService } from "../services/utilisateurs.service";

interface UtilisateursHeaderProps {
  isSupervision: boolean;
  onOpenCreateModal: () => void;
  onExportReport: () => void;
  onImportSuccess?: () => void;
}

/**
 * En-tête de section dédié à la gestion des utilisateurs (UtilisateursHeader).
 */
export function UtilisateursHeader({
  isSupervision,
  onOpenCreateModal,
  onExportReport,
  onImportSuccess,
}: UtilisateursHeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await utilisateursService.importCsv(file);
      toast.success(res.message);
      if (onImportSuccess) onImportSuccess();
    } catch {
      toast.error("Erreur lors de l'importation du fichier CSV.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <PageHeader
      title="Gestion des Utilisateurs"
      description="Administration des comptes d'accès au système (Administrateurs, Supervision et Agents de sécurité)."
      action={
        !isSupervision ? (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isImporting}
            >
              <Upload className="size-4" />
              Importer CSV
            </Button>

            <Button variant="default" onClick={onOpenCreateModal}>
              <UserPlus className="size-4" />+ Ajouter un utilisateur
            </Button>
          </div>
        ) : (
          <Button variant="gold" onClick={onExportReport}>
            <Download className="size-4" />
            Exporter les comptes (PDF)
          </Button>
        )
      }
    />
  );
}
