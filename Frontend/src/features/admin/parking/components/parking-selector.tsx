"use client";

import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ParkingItem } from "../types";

interface ParkingSelectorProps {
  parkings: ParkingItem[];
  selectedParkingId: number | null;
  onSelectParking: (id: number | null) => void;
  onAddParking: () => void;
  onEditParking: (parking: ParkingItem) => void;
  onDeleteParking: (parking: ParkingItem) => void;
  isSupervision?: boolean;
}

/**
 * Composant de sélection multi-parkings et de gestion des actions CRUD pour l'en-tête de section.
 */
export function ParkingSelector({
  parkings,
  selectedParkingId,
  onSelectParking,
  onAddParking,
  onEditParking,
  onDeleteParking,
  isSupervision = false,
}: ParkingSelectorProps) {
  const currentParking =
    parkings.find((p) => p.id === selectedParkingId) || null;

  const parkingOptions = React.useMemo(() => {
    return [
      { label: `Tous les parkings (${parkings.length})`, value: "all" },
      ...parkings.map((p) => ({
        label: `${p.nom}${p.capacite_maximale ? ` (${p.capacite_maximale} pl.)` : ""}`,
        value: String(p.id),
      })),
    ];
  }, [parkings]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl shadow-xs">
      {/* Sélecteur de parking */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-green-700/10 text-brand-green-700">
            <Building2 className="size-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Parking actif :
          </span>
        </div>

        <div className="w-[230px]">
          <Select
            value={selectedParkingId ? String(selectedParkingId) : "all"}
            onChange={(e) => {
              const val = e.target.value;
              onSelectParking(val === "all" || !val ? null : Number(val));
            }}
            options={parkingOptions}
            className="text-xs font-medium h-9"
          />
        </div>

        {/* Détails sommaires du parking sélectionné */}
        {currentParking && (
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground border-l border-border pl-3">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-foreground">Niveaux :</span>{" "}
              {currentParking.nombre_niveaux === 0
                ? "Surface (0)"
                : currentParking.nombre_niveaux}
            </span>
            {currentParking.capacite_maximale !== null &&
              currentParking.capacite_maximale !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">
                    Capacité :
                  </span>{" "}
                  {currentParking.capacite_maximale} places
                </span>
              )}
            {currentParking.capacites_niveaux &&
              Object.keys(currentParking.capacites_niveaux).length > 0 && (
                <span
                  className="hidden lg:inline-flex items-center gap-1 font-mono text-[11px] text-brand-green-700 bg-brand-green-700/10 px-2 py-0.5 rounded"
                  title={Object.entries(currentParking.capacites_niveaux)
                    .map(([lvl, cap]) => `${lvl}: ${cap} pl.`)
                    .join(", ")}
                >
                  {Object.entries(currentParking.capacites_niveaux)
                    .slice(0, 2)
                    .map(([lvl, cap]) => `${lvl}: ${cap}`)
                    .join(" | ")}
                  {Object.keys(currentParking.capacites_niveaux).length > 2 &&
                    "..."}
                </span>
              )}
            {currentParking.adresse && (
              <span
                className="flex items-center gap-1 truncate max-w-[200px]"
                title={currentParking.adresse}
              >
                <MapPin className="size-3.5 text-brand-green-700 shrink-0" />
                <span className="truncate">{currentParking.adresse}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions Admin sur l'infrastructure de parking */}
      {!isSupervision && (
        <div className="flex items-center gap-2">
          {currentParking ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditParking(currentParking)}
                className="gap-1.5 text-xs text-foreground border-input hover:bg-muted"
                title="Modifier ce parking"
              >
                <Pencil className="size-3.5 text-brand-yellow-500" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteParking(currentParking)}
                className="gap-1.5 text-xs text-brand-red-700 border-brand-red-700/20 hover:bg-brand-red-700/10"
                title="Supprimer ce parking"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onAddParking}
              className="gap-1.5 text-xs font-semibold bg-brand-green-700 hover:bg-brand-green-700/90 text-white"
            >
              <Plus className="size-3.5" />
              Nouveau Parking
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
