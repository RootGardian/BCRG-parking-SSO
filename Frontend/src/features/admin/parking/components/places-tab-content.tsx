"use client";

import {
  Building2,
  Info,
  Layers,
  LayoutGrid,
  List,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ParkingItem, PlaceParkingItem } from "../types";

interface PlacesTabContentProps {
  places: PlaceParkingItem[];
  isLoading: boolean;
  isSupervision: boolean;
  onDeletePlace: (place: PlaceParkingItem) => void;
  selectedParking?: ParkingItem | null;
  availableNiveaux?: string[];
}

/**
 * Formate proprement le libellé d'un niveau issu dynamiquement du parking ou de l'API.
 * Préserve fidèlement le nom réel défini (ex: "Niveau 1", "Sous-sol 2", "Surface").
 */
export function formatNiveauLabel(niveau?: string | null): string {
  if (!niveau) return "Niveau standard";
  const str = String(niveau).trim();
  if (!str) return "Niveau standard";
  // Nettoie les underscores techniques (ex: "Sous_sol_1" -> "Sous sol 1")
  const cleaned = str.replace(/_/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Contenu de l'Onglet "Parking & Places" :
 * Propose une double vue exclusive (Synoptique visuelle ou Tableau détaillé)
 * avec gestion 100% dynamique des niveaux renvoyés par l'API et le parking actif.
 */
export function PlacesTabContent({
  places,
  isLoading,
  isSupervision,
  onDeletePlace,
  selectedParking,
  availableNiveaux = [],
}: PlacesTabContentProps) {
  const [viewMode, setViewMode] = React.useState<"synoptique" | "tableau">(
    "synoptique",
  );
  const [search, setSearch] = React.useState("");
  const [niveauFilter, setNiveauFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    React.useState<PlaceParkingItem | null>(null);

  // 1. Détection 100% dynamique des niveaux du parking actif et des places
  const dynamicNiveaux = React.useMemo(() => {
    const set = new Set<string>();

    // a. Niveaux configurés sur le parking sélectionné (capacites_niveaux)
    if (selectedParking?.capacites_niveaux) {
      for (const niv of Object.keys(selectedParking.capacites_niveaux)) {
        if (niv.trim() !== "") {
          set.add(niv.trim());
        }
      }
    }

    // b. Niveaux dérivés passés en props
    if (availableNiveaux && availableNiveaux.length > 0) {
      for (const niv of availableNiveaux) {
        if (niv.trim() !== "") {
          set.add(niv.trim());
        }
      }
    }

    // c. Niveaux constatés sur les places existantes
    for (const p of places) {
      if (p.niveau && p.niveau.trim() !== "") {
        set.add(p.niveau.trim());
      }
    }

    // d. Repli selon nombre_niveaux si rien d'autre n'est renseigné
    if (set.size === 0 && selectedParking) {
      if (selectedParking.nombre_niveaux === 0) {
        set.add("Surface");
      } else {
        for (let i = 1; i <= selectedParking.nombre_niveaux; i++) {
          set.add(`Sous-sol ${i}`);
        }
      }
    }

    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [places, selectedParking, availableNiveaux]);

  // Options du sélecteur de niveau
  const niveauOptions = React.useMemo(() => {
    return [
      {
        label: `Tous les niveaux (${dynamicNiveaux.length || 1})`,
        value: "all",
      },
      ...dynamicNiveaux.map((niv) => {
        const cap = selectedParking?.capacites_niveaux?.[niv];
        return {
          label: `${formatNiveauLabel(niv)}${cap ? ` (${cap} pl.)` : ""}`,
          value: niv,
        };
      }),
    ];
  }, [dynamicNiveaux, selectedParking]);

  // 2. Filtrage des places
  const filteredPlaces = React.useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, "");

    return places.filter((p) => {
      // Recherche textuelle sur le numéro d'emplacement
      if (search.trim() !== "") {
        const q = search.toLowerCase().trim();
        if (!p.numero.toLowerCase().includes(q)) return false;
      }
      // Filtrage par niveau dynamique avec tolérance sur le format
      if (niveauFilter !== "all") {
        const normFilter = norm(niveauFilter);
        const normPlaceNiveau = norm(p.niveau);
        if (normPlaceNiveau !== normFilter && p.niveau !== niveauFilter) {
          return false;
        }
      }
      // Filtrage par catégorie
      if (categoryFilter === "visiteur" && !p.est_visiteur) return false;
      if (categoryFilter === "fonction" && p.est_visiteur) return false;
      if (categoryFilter === "occupee" && !p.est_occupee) return false;
      if (categoryFilter === "libre" && p.est_occupee) return false;

      return true;
    });
  }, [places, search, niveauFilter, categoryFilter]);

  // 3. Groupement des places par niveau dynamique pour le mode synoptique
  const groupedPlacesByNiveau = React.useMemo(() => {
    const groups: {
      niveau: string;
      label: string;
      items: PlaceParkingItem[];
    }[] = [];

    const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, "");

    // Si des niveaux sont détectés
    if (dynamicNiveaux.length > 0) {
      for (const niv of dynamicNiveaux) {
        const normNiv = norm(niv);
        const items = filteredPlaces.filter(
          (p) => norm(p.niveau) === normNiv || p.niveau === niv,
        );
        if (
          items.length > 0 ||
          niveauFilter === "all" ||
          niveauFilter === niv
        ) {
          groups.push({
            niveau: niv,
            label: formatNiveauLabel(niv),
            items,
          });
        }
      }
    } else {
      // Cas repli si aucune valeur de niveau n'est renseignée
      groups.push({
        niveau: "defaut",
        label: "Emplacements Principaux",
        items: filteredPlaces,
      });
    }

    return groups;
  }, [filteredPlaces, dynamicNiveaux, niveauFilter]);

  // Colonnes pour le mode Tableau
  const columns = [
    {
      key: "numero",
      header: "Numéro d'Emplacement",
      sortable: true,
      accessor: (row: PlaceParkingItem) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border">
          {row.numero}
        </span>
      ),
    },
    {
      key: "niveau",
      header: "Niveau du Sous-Sol",
      sortable: true,
      accessor: (row: PlaceParkingItem) => (
        <span className="text-xs font-medium text-foreground">
          {formatNiveauLabel(row.niveau)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type de Place",
      accessor: (row: PlaceParkingItem) => (
        <Badge variant={row.est_visiteur ? "gold" : "default"}>
          {row.est_visiteur ? "Visiteur" : "Fonction Rattachée"}
        </Badge>
      ),
    },
    {
      key: "statut",
      header: "Statut d'Occupation",
      accessor: (row: PlaceParkingItem) => (
        <Badge variant={row.est_occupee ? "destructive" : "success"}>
          {row.est_occupee ? "Occupée" : "Disponible"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      accessor: (row: PlaceParkingItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedPlaceForModal(row)}
            title="Consulter les détails"
          >
            <Info className="size-3.5" />
          </Button>

          {row.est_visiteur && !isSupervision && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-brand-red-700 hover:bg-brand-red-700/10 h-8 text-xs gap-1"
              onClick={() => onDeletePlace(row)}
              title="Supprimer cette place visiteur"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Barre de commande et de filtrage unifiée */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-xs">
        {/* Recherche rapide */}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un emplacement (ex: P-01, V-02)..."
            className="pl-9 text-xs h-9"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="size-3.5" />
          </div>
        </div>

        {/* Filtres contextuels */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur dynamique de niveau */}
          <div className="w-44">
            <Select
              options={niveauOptions}
              value={niveauFilter}
              onChange={(e) => setNiveauFilter(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Sélecteur de statut/type */}
          <div className="w-44">
            <Select
              options={[
                { label: "Toutes les places", value: "all" },
                { label: "Places Fonctions", value: "fonction" },
                { label: "Places Visiteurs", value: "visiteur" },
                { label: "Places Libres", value: "libre" },
                { label: "Places Occupées", value: "occupee" },
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Commutateur de vue exclusif (Plan Synoptique vs Tableau) */}
          <div className="flex items-center p-0.5 rounded-lg bg-secondary border border-border">
            <button
              type="button"
              onClick={() => setViewMode("synoptique")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "synoptique"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
              title="Afficher la cartographie spatiale synoptique"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tableau")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "tableau"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
              title="Afficher la liste détaillée sous forme de tableau"
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">Tableau</span>
            </button>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="p-6 rounded-xl bg-card border border-border space-y-3">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {[
              "p-skel-1",
              "p-skel-2",
              "p-skel-3",
              "p-skel-4",
              "p-skel-5",
              "p-skel-6",
              "p-skel-7",
              "p-skel-8",
            ].map((key) => (
              <Skeleton key={key} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* VUE 1 : Plan Synoptique Interactif (Groupé par Niveau Dynamique) */}
      {!isLoading && viewMode === "synoptique" && (
        <div className="space-y-4">
          {groupedPlacesByNiveau.length === 0 || filteredPlaces.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-card border border-border">
              <Building2 className="size-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Aucun emplacement trouvé
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aucun emplacement ne correspond aux filtres sélectionnés.
              </p>
            </div>
          ) : (
            groupedPlacesByNiveau.map((group) => {
              if (group.items.length === 0) return null;

              const totalInGroup = group.items.length;
              const occInGroup = group.items.filter(
                (p) => p.est_occupee,
              ).length;
              const freeInGroup = totalInGroup - occInGroup;

              return (
                <div
                  key={group.niveau}
                  className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-xs"
                >
                  {/* En-tête de niveau */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-brand-green-700/10 text-brand-green-700">
                        <Layers className="size-4" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold font-brand text-foreground">
                        {group.label}
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({totalInGroup} place{totalInGroup > 1 ? "s" : ""})
                      </span>
                    </div>

                    {/* Synthèse rapide du niveau */}
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-600 inline-block" />
                        {freeInGroup} libre{freeInGroup > 1 ? "s" : ""}
                      </span>
                      {occInGroup > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="size-1.5 rounded-full bg-amber-600 inline-block" />
                          {occInGroup} occupée{occInGroup > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grille des baies de stationnement */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 pt-1">
                    {group.items.map((place) => {
                      const isOcc = place.est_occupee;
                      const isVisiteur = place.est_visiteur;

                      return (
                        <button
                          type="button"
                          key={place.id}
                          onClick={() => setSelectedPlaceForModal(place)}
                          className={`group relative p-2.5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-focus-ring ${isOcc
                            ? "bg-amber-500/10 border-amber-500/40 text-foreground"
                            : isVisiteur
                              ? "bg-amber-50/60 border-amber-200/80 text-foreground hover:border-amber-300"
                              : "bg-emerald-50/60 border-emerald-200/80 text-foreground hover:border-emerald-300"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {place.numero}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isVisiteur
                                ? "bg-amber-100 text-amber-800"
                                : "bg-brand-green-700/10 text-brand-green-700"
                                }`}
                            >
                              {isVisiteur ? "Visiteur" : "Personnel"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                              <span
                                className={`size-1.5 rounded-full ${isOcc ? "bg-amber-600" : "bg-emerald-600"
                                  }`}
                              />
                              {isOcc ? "Occupé" : "Libre"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VUE 2 : Tableau Détaillé */}
      {!isLoading && viewMode === "tableau" && (
        <DataTable
          columns={columns}
          data={filteredPlaces}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Aucun emplacement de parking ne correspond aux critères recherchés."
        />
      )}

      {/* Modale de Détails Rapides sur un Emplacement */}
      <Dialog
        isOpen={!!selectedPlaceForModal}
        onClose={() => setSelectedPlaceForModal(null)}
        title={`Emplacement ${selectedPlaceForModal?.numero || ""}`}
        description="Fiche détaillée de l'emplacement et statut en temps réel."
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {selectedPlaceForModal?.est_visiteur && !isSupervision && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const target = selectedPlaceForModal;
                    setSelectedPlaceForModal(null);
                    onDeletePlace(target);
                  }}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Trash2 className="size-3.5" />
                  Supprimer cet emplacement
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedPlaceForModal(null)}
            >
              Fermer
            </Button>
          </div>
        }
      >
        {selectedPlaceForModal && (
          <div className="space-y-3 py-1 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Niveau
                </span>
                <span className="font-semibold text-foreground">
                  {formatNiveauLabel(selectedPlaceForModal.niveau)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Type
                </span>
                <span className="font-semibold text-foreground">
                  {selectedPlaceForModal.est_visiteur
                    ? "Réservée Visiteurs"
                    : "Réservée Personnel"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Statut
                </span>
                <Badge
                  variant={
                    selectedPlaceForModal.est_occupee
                      ? "destructive"
                      : "success"
                  }
                  className="mt-0.5"
                >
                  {selectedPlaceForModal.est_occupee ? "Occupée" : "Disponible"}
                </Badge>
              </div>
              {/* <div>
                <span className="text-muted-foreground block text-[11px]">
                  Identifiant système
                </span>
                <span className="font-mono text-muted-foreground">
                  #{selectedPlaceForModal.id}
                </span>
              </div> */}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
