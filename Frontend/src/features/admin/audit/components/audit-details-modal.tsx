"use client";

import {
  Calendar,
  Clock,
  FileText,
  Hash,
  Shield,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { AuditLog } from "../types";

interface AuditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

/**
 * Fonction utilitaire retournant la classe CSS et le libellé de l'action.
 */
function getActionBadgeStyle(action: string): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  if (action.startsWith("CREATE") || action.startsWith("IMPORT")) {
    return {
      bgClass: "bg-emerald-500/10",
      textClass: "text-emerald-700",
      borderClass: "border-emerald-500/20",
    };
  }
  if (action.startsWith("UPDATE") || action.startsWith("CORRECTION")) {
    return {
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-700",
      borderClass: "border-blue-500/20",
    };
  }
  if (
    action.includes("PASSWORD") ||
    action.includes("COMPTE") ||
    action.includes("AUTH")
  ) {
    return {
      bgClass: "bg-brand-yellow-500/15",
      textClass: "text-amber-800",
      borderClass: "border-brand-yellow-500/30",
    };
  }
  if (action.startsWith("DELETE") || action.startsWith("SUSPEND")) {
    return {
      bgClass: "bg-brand-red-700/10",
      textClass: "text-brand-red-700",
      borderClass: "border-brand-red-700/20",
    };
  }
  return {
    bgClass: "bg-secondary",
    textClass: "text-foreground",
    borderClass: "border-border",
  };
}

/**
 * Modale d'inspection approfondie d'une entrée du journal d'audit (AuditDetailsModal).
 */
export function AuditDetailsModal({
  isOpen,
  onClose,
  log,
}: AuditDetailsModalProps) {
  if (!log) return null;

  const style = getActionBadgeStyle(log.action);
  const formattedDate = new Date(log.date_action).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de l'Événement d'Audit"
      description={`Enregistrement officiel #${log.id} extrait du journal système.`}
      maxWidth="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-4 pt-2">
        {/* En-tête de l'action */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${style.bgClass} ${style.textClass} ${style.borderClass}`}
            >
              <Shield className="size-3.5 mr-1.5 shrink-0" />
              {log.action}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Opérateur */}
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <User className="size-3.5" />
              <span>Opérateur (Auteur)</span>
            </div>
            <div className="font-bold font-brand text-foreground text-sm">
              {log.utilisateur.nom}
            </div>
            <div className="text-xs font-mono font-medium text-muted-foreground">
              Matricule : {log.utilisateur.matricule}
            </div>
          </div>

          {/* Cible */}
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <Target className="size-3.5" />
              <span>Entité Cible</span>
            </div>
            <div className="font-bold font-mono text-foreground text-sm">
              {log.cible}
            </div>
            <div className="text-xs text-muted-foreground">
              Référence du composant impacté
            </div>
          </div>
        </div>

        {/* Détails textuels complets */}
        <div className="p-3.5 rounded-lg border border-border bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <FileText className="size-3.5" />
            <span>Description de l&apos;Opération</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {log.details ||
              "Aucun détail complémentaire enregistré pour cette action."}
          </p>
        </div>

        {/* Métadonnées techniques */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/70 text-xs text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Hash className="size-3" />
            <span>ID Log : {log.id}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>Horodatage UTC : {log.date_action}</span>
          </span>
        </div>
      </div>
    </Dialog>
  );
}
