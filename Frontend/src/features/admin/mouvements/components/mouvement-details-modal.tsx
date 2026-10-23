"use client";

import { Calendar, Car, Clock, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Mouvement } from "@/types/models";

interface MouvementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mouvement: Mouvement | null;
}

/**
 * Dialogue modale de fiche détaillée d'un mouvement d'audit (MouvementDetailsModal).
 */
export function MouvementDetailsModal({
  isOpen,
  onClose,
  mouvement,
}: MouvementDetailsModalProps) {
  if (!mouvement) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails du Mouvement #${mouvement.id}`}
      description="Fiche d'audit complète de l'accès véhicule enregistrée au guichet."
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Fermer la fiche
        </Button>
      }
    >
      <div className="space-y-4 text-sm">
        {/* Véhicule & Statut */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-brand-green-700 text-white flex items-center justify-center font-bold">
              <Car className="size-5" />
            </div>
            <div>
              <div className="font-bold text-lg font-brand text-foreground">
                {mouvement.vehicule?.numero_plaque}
              </div>
              <div className="text-xs text-muted-foreground">
                {mouvement.vehicule?.marque_modele || "Véhicule non spécifié"}
              </div>
            </div>
          </div>
          <StatusBadge type="statut" value={mouvement.statut} />
        </div>

        {/* Grille d'informations d'horodatage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-emerald-600" />
              <span>Heure d'Entrée</span>
            </div>
            <div className="font-bold text-sm text-foreground">
              {new Date(mouvement.heure_arrivee).toLocaleString("fr-FR")}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-amber-600" />
              <span>Heure de Sortie</span>
            </div>
            <div className="font-bold text-sm text-foreground">
              {mouvement.heure_depart
                ? new Date(mouvement.heure_depart).toLocaleString("fr-FR")
                : "Actuellement sur site"}
            </div>
          </div>
        </div>

        {/* Propriétaire & Agent */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <User className="size-3.5" />
              Catégorie & Usage
            </span>
            <Badge
              variant={mouvement.categorie === "personnel" ? "default" : "gold"}
            >
              {mouvement.categorie === "personnel"
                ? "Personnel BCRG"
                : "Visiteur Externe"}
            </Badge>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-brand-green-700" />
              Agent Opérateur Guichet
            </span>
            <div className="text-sm font-semibold text-foreground">
              {mouvement.agent?.utilisateur
                ? `${mouvement.agent.utilisateur.prenom} ${mouvement.agent.utilisateur.nom} (${mouvement.agent.utilisateur.matricule})`
                : "Agent Guichet"}
            </div>
          </div>
        </div>

        {/* Observation / Motif */}
        {mouvement.observation && (
          <div className="p-3 rounded-lg bg-accent/40 border border-border text-xs space-y-1">
            <span className="font-bold text-foreground block">
              Observation / Motif de visite :
            </span>
            <p className="text-muted-foreground">{mouvement.observation}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
