"use client";

import { AlertCircle, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialogue modale d'importation de masse de la flotte via fichier CSV/Excel (ImportCSVModal).
 */
export function ImportCSVModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportCSVModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier CSV à importer");
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);
        toast.success(
          `${results.data.length} enregistrements d'immatriculation importés avec succès !`,
        );
        onSuccess();
        onClose();
      },
      error: () => {
        setIsProcessing(false);
        toast.error("Erreur lors de la lecture du fichier CSV");
      },
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Importation de Masse (CSV / Excel)"
      description="Chargez un fichier d'immatriculations pour mettre à jour en bloc la flotte autorisée de la BCRG."
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!file || isProcessing}
            isLoading={isProcessing}
            onClick={handleImport}
          >
            Lancer l'importation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Dropzone d'import de fichier */}
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-accent/30 transition-colors">
          <FileSpreadsheet className="size-10 text-brand-green-700 dark:text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {file
              ? file.name
              : "Cliquez ou glissez votre fichier CSV / Excel ici"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formats acceptés : .csv, .xlsx (colonnes : numero_plaque,
            marque_modele, couleur)
          </p>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            Les plaques d'immatriculation déjà existantes dans le système seront
            automatiquement mises à jour sans créer de doublons.
          </span>
        </div>
      </div>
    </Dialog>
  );
}
