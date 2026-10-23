"use client";

import { Download, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

interface AuditHeaderProps {
  isSupervision?: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

/**
 * En-tête de section dédié au Journal d'Audit de Sécurité.
 */
export function AuditHeader({
  isSupervision = false,
  onRefresh,
  onExport,
}: AuditHeaderProps) {
  return (
    <PageHeader
      title="Journal d'Audit de Sécurité"
      description="Traçabilité exhaustive et horodatée des actions administratives critiques (créations, corrections, réinitialisations, suppressions)."
      isSupervision={isSupervision}
      extraAction={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={onExport}
            className="bg-brand-green-700 hover:bg-brand-green-700/90 text-white font-semibold flex items-center gap-2 shadow-xs"
          >
            <Download className="size-4" />
            <span>Exporter le Journal (CSV)</span>
          </Button>
        </div>
      }
    />
  );
}
