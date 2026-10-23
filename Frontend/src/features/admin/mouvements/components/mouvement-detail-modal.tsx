"use client";

import { ArrowDownLeft, ArrowUpRight, Clock, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { MouvementItem } from "../types";

interface MouvementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mouvement?: MouvementItem | null;
}

function formatDateHeure(isoString?: string | null): string {
  if (!isoString) return "En cours...";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Modale de consultation détaillée d'un passage au parking (MouvementDetailModal).
 */
export function MouvementDetailModal({
  isOpen,
  onClose,
  mouvement,
}: MouvementDetailModalProps) {
  if (!isOpen || !mouvement) return null;

  const userConducteur = mouvement.vehicule?.personnel?.utilisateur;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Fiche Détaillée du Mouvement"
      description={`Identifiant du passage : #${mouvement.id}`}
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        {/* En-tête Statut & Catégorie */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                mouvement.statut === "sur_site" ? "success" : "secondary"
              }
            >
              {mouvement.statut === "sur_site" ? "Sur site" : "Hors site"}
            </Badge>
            <Badge
              variant={
                mouvement.type_entree === "personnel" ? "default" : "gold"
              }
            >
              {mouvement.type_entree === "personnel"
                ? "Personnel BCRG"
                : "Visiteur"}
            </Badge>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            Réf: MOV-{mouvement.id}
          </span>
        </div>

        {/* Timeline des Horodateurs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center gap-1.5 text-brand-green-700 font-semibold">
              <ArrowDownLeft className="size-4" />
              <span>Heure d&apos;Entrée</span>
            </div>
            <div className="font-semibold text-foreground text-xs">
              {formatDateHeure(mouvement.heure_arrivee)}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <ArrowUpRight className="size-4" />
              <span>Heure de Sortie</span>
            </div>
            <div className="font-semibold text-foreground text-xs">
              {formatDateHeure(mouvement.heure_depart)}
            </div>
          </div>
        </div>

        {/* Détails du Véhicule & Occupant */}
        <div className="p-3 rounded-lg border border-border bg-card space-y-2">
          <div className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            Véhicule & Conducteur
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
                {mouvement.vehicule?.numero_plaque || "IMMAT-INCONNUE"}
              </span>
              <div className="text-muted-foreground text-xs mt-1">
                {mouvement.vehicule?.marque_modele} ·{" "}
                {mouvement.vehicule?.couleur}
              </div>
            </div>

            {userConducteur ? (
              <div className="text-right space-y-0.5">
                <div className="flex items-center justify-end gap-1 font-bold text-foreground font-brand">
                  <User className="size-3 text-brand-green-700" />
                  {userConducteur.prenom} {userConducteur.nom}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Matricule: {userConducteur.matricule}
                </div>
              </div>
            ) : (
              <div className="text-right text-muted-foreground italic">
                Visiteur Externe
              </div>
            )}
          </div>
        </div>

        {/* Agent & Observation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2">
            <Shield className="size-4 text-brand-green-700 shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">
                Agent Vigile :
              </div>
              <div className="font-semibold text-foreground">
                {mouvement.agent?.prenom || mouvement.agent?.nom
                  ? `${mouvement.agent.prenom || ""} ${mouvement.agent.nom || ""}`
                  : "Guichet Sous-Sol"}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2">
            <Clock className="size-4 text-blue-600 shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">
                Observation :
              </div>
              <div className="font-medium text-foreground truncate max-w-[130px]">
                {mouvement.observation || "Aucune note"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
