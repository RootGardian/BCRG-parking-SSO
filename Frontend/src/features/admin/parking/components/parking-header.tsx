"use client";

import { Award, Plus, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { ParkingItem } from "../types";
import { ParkingSelector } from "./parking-selector";

interface ParkingHeaderProps {
  isSupervision: boolean;
  parkings: ParkingItem[];
  selectedParkingId: number | null;
  activeTab?: "parking" | "fonctions";
  onSelectParking: (id: number | null) => void;
  onAddParking: () => void;
  onEditParking: (parking: ParkingItem) => void;
  onDeleteParking: (parking: ParkingItem) => void;
  onAddPlaceVisiteur: () => void;
  onCreateFonction: () => void;
}

/**
 * En-tête de section dédié à l'administration du parking et des fonctions (ParkingHeader).
 */
export function ParkingHeader({
  isSupervision,
  parkings,
  selectedParkingId,
  activeTab = "parking",
  onSelectParking,
  onAddParking,
  onEditParking,
  onDeleteParking,
  onAddPlaceVisiteur,
  onCreateFonction,
}: ParkingHeaderProps) {
  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Gestion du Parking & Fonctions"
        description="Administration de la cartographie des emplacements sous-sol, des infrastructures et des réservations par fonction."
        action={
          !isSupervision ? (
            selectedParkingId !== null ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={activeTab === "parking" ? "default" : "outline"}
                  className={`gap-2 text-xs font-semibold ${
                    activeTab === "parking"
                      ? "bg-brand-green-700 hover:bg-brand-green-700/90 text-white shadow-xs"
                      : "border-border hover:bg-accent text-foreground"
                  }`}
                  onClick={onAddPlaceVisiteur}
                >
                  <Plus className="size-4" />
                  Place Visiteur
                </Button>

                <Button
                  type="button"
                  variant={activeTab === "fonctions" ? "default" : "outline"}
                  className={`gap-2 text-xs font-semibold ${
                    activeTab === "fonctions"
                      ? "bg-brand-green-700 hover:bg-brand-green-700/90 text-white shadow-xs"
                      : "border-border hover:bg-accent text-foreground"
                  }`}
                  onClick={onCreateFonction}
                >
                  <Award className="size-4" />
                  Affecter une fonction à une place
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="gap-2 text-xs font-semibold bg-brand-green-700 hover:bg-brand-green-700/90 text-white shadow-xs"
                onClick={onAddParking}
              >
                <Plus className="size-4" />
                Nouveau Parking
              </Button>
            )
          ) : (
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-xs font-semibold"
              onClick={() => window.print()}
            >
              <Printer className="size-4 text-muted-foreground" />
              Imprimer le rapport
            </Button>
          )
        }
      />

      {/* Sélecteur de parking et CRUD infrastructure */}
      <ParkingSelector
        parkings={parkings}
        selectedParkingId={selectedParkingId}
        onSelectParking={onSelectParking}
        onAddParking={onAddParking}
        onEditParking={onEditParking}
        onDeleteParking={onDeleteParking}
        isSupervision={isSupervision}
      />
    </div>
  );
}
