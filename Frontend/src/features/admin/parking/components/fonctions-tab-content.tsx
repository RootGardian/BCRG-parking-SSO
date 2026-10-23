"use client";

import { Award, Info, Search } from "lucide-react";
import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FonctionItem } from "../types";
import { formatNiveauLabel } from "./places-tab-content";

interface FonctionsTabContentProps {
  fonctions: FonctionItem[];
  isLoading: boolean;
  isSupervision: boolean;
  onDeleteFonction?: (fonction: FonctionItem) => void;
  selectedParkingId?: number | null;
}

/**
 * Contenu de l'Onglet 2 ("Fonctions") : Référentiel des fonctions institutionnelles BCRG et attribution des places.
 */
export function FonctionsTabContent({
  fonctions,
  isLoading,
  selectedParkingId,
}: FonctionsTabContentProps) {
  const [search, setSearch] = React.useState("");
  const [attributionFilter, setAttributionFilter] = React.useState<
    "all" | "place_attribuee" | "place_non_attribuee"
  >("all");
  const [selectedFonctionForModal, setSelectedFonctionForModal] =
    React.useState<FonctionItem | null>(null);

  // Métriques d'attribution
  const countWithPlace = React.useMemo(() => {
    return fonctions.filter(
      (f) => f.places_parking && f.places_parking.length > 0,
    ).length;
  }, [fonctions]);

  const countWithoutPlace = fonctions.length - countWithPlace;

  // Filtrage combiné recherche et attribution
  const filteredFonctions = React.useMemo(() => {
    return fonctions.filter((f) => {
      // 1. Filtrage recherche
      if (search.trim() !== "") {
        const q = search.toLowerCase().trim();
        const matchesName = f.nom.toLowerCase().includes(q);
        const matchesPlace = f.places_parking?.some((p) =>
          p.numero.toLowerCase().includes(q),
        );
        if (!matchesName && !matchesPlace) return false;
      }

      // 2. Filtrage statut attribution
      const hasPlace = Boolean(f.places_parking && f.places_parking.length > 0);
      if (attributionFilter === "place_attribuee" && !hasPlace) return false;
      if (attributionFilter === "place_non_attribuee" && hasPlace) return false;

      return true;
    });
  }, [fonctions, search, attributionFilter]);

  const columns = [
    {
      key: "nom",
      header: "Intitulé de la Fonction ",
      sortable: true,
      accessor: (row: FonctionItem) => (
        <div className="flex items-center gap-2.5 font-bold text-xs text-foreground font-brand">
          <div className="p-1.5 rounded-md bg-brand-green-700/10 text-brand-green-700 shrink-0">
            <Award className="size-4" />
          </div>
          <span>{row.nom}</span>
        </div>
      ),
    },
    {
      key: "places",
      header: "Place(s) de Parking Attribuée(s)",
      accessor: (row: FonctionItem) => {
        const hasPlaces = row.places_parking && row.places_parking.length > 0;

        if (!hasPlaces) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/80">
              Place non attribuée
            </span>
          );
        }

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.places_parking?.map((p) => (
              <span
                key={p.id}
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs"
              >
                {p.numero} ({formatNiveauLabel(p.niveau)})
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: FonctionItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedFonctionForModal(row)}
            title="Consulter les détails"
          >
            <Info className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une fonction ou une place (ex: Gouverneur, P-01)..."
            className="pl-9 text-xs h-9"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="size-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select
              options={[
                {
                  label: `Toutes les fonctions (${fonctions.length})`,
                  value: "all",
                },
                {
                  label: `Place Attribuée (${countWithPlace})`,
                  value: "place_attribuee",
                },
                {
                  label: `Place non Attribuée (${countWithoutPlace})`,
                  value: "place_non_attribuee",
                },
              ]}
              value={attributionFilter}
              onChange={(e) =>
                setAttributionFilter(
                  e.target.value as
                  | "all"
                  | "place_attribuee"
                  | "place_non_attribuee",
                )
              }
              className="text-xs h-9"
            />
          </div>

          <div className="text-xs text-muted-foreground font-medium hidden md:block pl-2 border-l border-border">
            Total :{" "}
            <span className="font-bold text-foreground">
              {filteredFonctions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tableau des fonctions */}
      <DataTable
        columns={columns}
        data={filteredFonctions}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={
          selectedParkingId === null
            ? "Aucune place attribuée aux fonctions. Sélectionnez un parking actif pour procéder à des attributions."
            : "Aucune fonction n'a de place attribuée sur ce parking pour le moment."
        }
      />

      {/* Modale de Détails de la Fonction Institutionnelle */}
      <Dialog
        isOpen={!!selectedFonctionForModal}
        onClose={() => setSelectedFonctionForModal(null)}
        title={selectedFonctionForModal?.nom || "Détails de la Fonction"}
        description="Fiche détaillée de la fonction et de ses attributions d'emplacements."
        footer={
          <div className="flex items-center justify-end w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedFonctionForModal(null)}
            >
              Fermer
            </Button>
          </div>
        }
      >
        {selectedFonctionForModal && (
          <div className="space-y-4 py-1 text-xs">
            {/* Carte résumé fonction */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="p-2.5 rounded-xl bg-brand-green-700/10 text-brand-green-700 shrink-0">
                <Award className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-muted-foreground block text-[11px]">
                  Intitulé institutionnel
                </span>
                <span className="font-bold text-sm text-foreground font-brand truncate block">
                  {selectedFonctionForModal.nom}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[11px]">
                  Emplacement(s)
                </span>
                <span className="font-semibold text-foreground">
                  {selectedFonctionForModal.places_parking?.length || 0}{" "}
                  place(s)
                </span>
              </div>
            </div>

            {/* Liste des emplacements associés */}
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Emplacement(s) de parking réservé(s)
              </div>
              {selectedFonctionForModal.places_parking &&
                selectedFonctionForModal.places_parking.length > 0 ? (
                <div className="space-y-2">
                  {selectedFonctionForModal.places_parking.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300">
                          {place.numero}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatNiveauLabel(place.niveau)}
                        </span>
                      </div>
                      <Badge
                        variant={place.est_occupee ? "destructive" : "success"}
                      >
                        {place.est_occupee ? "Occupée" : "Libre"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-xs">
                  Aucun emplacement de parking n'est actuellement attribué à
                  cette fonction.
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
