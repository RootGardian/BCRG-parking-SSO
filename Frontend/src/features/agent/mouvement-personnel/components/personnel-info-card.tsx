"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  CheckCircle2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Vehicule } from "@/types/models";
import type { PersonnelScanResult } from "../types";

interface PersonnelInfoCardProps {
  scanResult: PersonnelScanResult;
  selectedVehicule: Vehicule | null;
  onSelectVehicule: (v: Vehicule | null) => void;
  observation: string;
  onObservationChange: (obs: string) => void;
  onValiderEntree: () => void;
  onValiderSortie: () => void;
  isSubmitting: boolean;
}

/**
 * Carte récapitulative des informations du membre scanné et validation réactive entrée/sortie.
 */
export function PersonnelInfoCard({
  scanResult,
  selectedVehicule,
  onSelectVehicule,
  observation,
  onObservationChange,
  onValiderEntree,
  onValiderSortie,
  isSubmitting,
}: PersonnelInfoCardProps) {
  const estSurSite = scanResult.est_sur_site;

  const vehicleOptions = (scanResult.vehicules || []).map((v) => ({
    label: `${v.numero_plaque} ${v.marque_modele ? `(${v.marque_modele})` : ""}`,
    value: String(v.id),
  }));

  const handleVehicleSelect = (idStr: string) => {
    const found = (scanResult.vehicules || []).find(
      (v) => String(v.id) === idStr,
    );
    onSelectVehicule(found || null);
  };

  return (
    <div
      className={`p-5 rounded-xl border shadow-md space-y-4 transition-all ${
        estSurSite
          ? "bg-amber-500/5 border-amber-500/30"
          : "bg-emerald-500/5 border-emerald-500/30"
      }`}
    >
      {/* En-tête Statut d'Emplacement */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge variant={estSurSite ? "gold" : "success"}>
            {estSurSite ? "Actuellement Sur Site" : "Hors Site"}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            Matricule : {scanResult.matricule}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold font-brand text-foreground">
          {estSurSite ? (
            <>
              <ArrowUpRight className="size-4 text-amber-600" />
              <span>Action Requise : Sortie du Parking</span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="size-4 text-emerald-600" />
              <span>Action Requise : Autoriser l&apos;Entrée</span>
            </>
          )}
        </div>
      </div>

      {/* Profil de l'agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
          <div className="p-2 rounded-full bg-brand-green-500/10 text-brand-green-700 shrink-0">
            <User className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">
              Identité du Personnel
            </div>
            <div className="font-bold text-base text-foreground font-brand">
              {scanResult.prenom} {scanResult.nom}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              {scanResult.fonction || "Personnel BCRG"}
            </div>
          </div>
        </div>

        {/* Sélection du Véhicule */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
          <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 shrink-0">
            <Car className="size-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="text-[11px] text-muted-foreground uppercase font-semibold">
              Véhicule Attribué
            </div>
            {vehicleOptions.length > 0 ? (
              <Select
                options={vehicleOptions}
                value={selectedVehicule ? String(selectedVehicule.id) : ""}
                onChange={(e) => handleVehicleSelect(e.target.value)}
              />
            ) : (
              <div className="text-xs text-muted-foreground italic pt-1">
                Aucun véhicule de fonction enregistré.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note / Observation */}
      <Input
        label="Observation ou note de passage (Optionnel)"
        placeholder="ex: Badge usagé, véhicule de remplacement..."
        value={observation}
        onChange={(e) => onObservationChange(e.target.value)}
      />

      {/* Bouton de Validation */}
      <div className="pt-2">
        {estSurSite ? (
          <Button
            type="button"
            variant="default"
            isLoading={isSubmitting}
            onClick={onValiderSortie}
            className="w-full h-12 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-lg"
          >
            <ArrowUpRight className="size-5" />
            VALIDER LA SORTIE DU PARKING
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            isLoading={isSubmitting}
            onClick={onValiderEntree}
            className="w-full h-12 text-sm font-bold bg-brand-green-700 hover:bg-brand-green-800 text-white gap-2 shadow-lg"
          >
            <CheckCircle2 className="size-5" />
            VALIDER L&apos;ENTRÉE DANS LE PARKING
          </Button>
        )}
      </div>
    </div>
  );
}
