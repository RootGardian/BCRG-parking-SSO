"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

interface MouvementsHeaderProps {
  isSupervision: boolean;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

/**
 * En-tête de section dédié à l'historique des mouvements (MouvementsHeader).
 */
export function MouvementsHeader({
  isSupervision,
  onExportPDF,
  onExportCSV,
}: MouvementsHeaderProps) {
  return (
    <PageHeader
      title="Historique & Registre des Mouvements"
      description="Journalisation des accès au parking sous-sol, suivi des présences en temps réel et export des rapports."
      action={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-border hover:bg-accent"
            onClick={onExportCSV}
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            Exporter CSV
          </Button>

          <Button
            type="button"
            variant="default"
            className="gap-2"
            onClick={onExportPDF}
          >
            <FileText className="size-4" />
            {isSupervision ? "Imprimer le rapport PDF" : "Exporter Rapport PDF"}
          </Button>
        </div>
      }
    />
  );
}
