"use client";

import { Award, Building2 } from "lucide-react";
import * as React from "react";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/shared/store/use-auth-store";
import { FonctionCreateModal } from "../components/fonction-create-modal";
import { FonctionsTabContent } from "../components/fonctions-tab-content";
import { ParkingHeader } from "../components/parking-header";
import { ParkingKPIsGrid } from "../components/parking-kpis-grid";
import { ParkingModal } from "../components/parking-modal";
import { PlaceVisiteurModal } from "../components/place-visiteur-modal";
import { PlacesTabContent } from "../components/places-tab-content";
import { useParking } from "../hooks/use-parking";

/**
 * Vue principale de Gestion du Parking et des Fonctions (ParkingPage).
 */
export function ParkingPage() {
  const { user } = useAuthStore();
  const isSupervision = user?.role === "supervision";
  const [activeTab, setActiveTab] = React.useState<"parking" | "fonctions">(
    "parking",
  );

  const {
    parkings,
    selectedParkingId,
    places,
    fonctions,
    isLoadingPlaces,
    isLoadingFonctions,
    isParkingModalOpen,
    setIsParkingModalOpen,
    editingParking,
    deleteParkingState,
    setDeleteParkingState,
    handleOpenCreateParkingModal,
    handleOpenEditParkingModal,
    handleCreateOrUpdateParking,
    handleConfirmDeleteParking,
    handleSelectParking,
    isPlaceVisiteurModalOpen,
    setIsPlaceVisiteurModalOpen,
    isFonctionCreateModalOpen,
    setIsFonctionCreateModalOpen,
    deletePlaceState,
    setDeletePlaceState,
    deleteFonctionState,
    setDeleteFonctionState,
    handleCreatePlaceVisiteur,
    handleConfirmDeletePlace,
    handleCreateFonction,
    handleConfirmDeleteFonction,
  } = useParking();

  const currentParking = React.useMemo(
    () => parkings.find((p) => p.id === selectedParkingId) || null,
    [parkings, selectedParkingId],
  );

  // Extraction dynamique des niveaux : capacites_niveaux du parking + places existantes
  const availableNiveaux = React.useMemo(() => {
    const set = new Set<string>();

    // 1. Niveaux configurés sur le parking sélectionné
    if (currentParking?.capacites_niveaux) {
      for (const niveau of Object.keys(currentParking.capacites_niveaux)) {
        if (niveau.trim() !== "") {
          set.add(niveau.trim());
        }
      }
    }

    // 2. Niveaux constatés sur les places existantes
    for (const p of places) {
      if (p.niveau && p.niveau.trim() !== "") {
        set.add(p.niveau.trim());
      }
    }

    // 3. Génération par défaut si nombre_niveaux > 0 et aucun libellé explicite
    if (set.size === 0 && currentParking && currentParking.nombre_niveaux > 0) {
      for (let i = 1; i <= currentParking.nombre_niveaux; i++) {
        set.add(`Sous-sol ${i}`);
      }
    }

    return Array.from(set).sort();
  }, [places, currentParking]);

  return (
    <div className="space-y-4">
      {/* 1. En-tête de section consolidé avec sélecteur et actions adaptées */}
      <ParkingHeader
        isSupervision={isSupervision}
        parkings={parkings}
        selectedParkingId={selectedParkingId}
        activeTab={activeTab}
        onSelectParking={handleSelectParking}
        onAddParking={handleOpenCreateParkingModal}
        onEditParking={handleOpenEditParkingModal}
        onDeleteParking={(parking) =>
          setDeleteParkingState({ isOpen: true, parking })
        }
        onAddPlaceVisiteur={() => setIsPlaceVisiteurModalOpen(true)}
        onCreateFonction={() => setIsFonctionCreateModalOpen(true)}
      />

      {/* 2. Bandeau KPIs compact avec jauge d'occupation */}
      <ParkingKPIsGrid places={places} isLoading={isLoadingPlaces} />

      {/* 3. Système d'Onglets avec synchronisation d'état */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "parking" | "fonctions")}
        className="space-y-3.5"
      >
        <TabsList className="bg-card border border-border p-1 rounded-xl shadow-xs">
          <TabsTrigger
            value="parking"
            className="gap-2 px-4 py-2 font-medium text-xs sm:text-sm data-[state=active]:bg-brand-green-700/10 data-[state=active]:text-brand-green-700"
          >
            <Building2 className="size-4" />
            Parking & Places
          </TabsTrigger>
          <TabsTrigger
            value="fonctions"
            className="gap-2 px-4 py-2 font-medium text-xs sm:text-sm data-[state=active]:bg-brand-green-700/10 data-[state=active]:text-brand-green-700"
          >
            <Award className="size-4" />
            Fonctions & Attributions
          </TabsTrigger>
        </TabsList>

        {/* Contenu Onglet 1 : "Parking & Places" (Plan synoptique ou Tableau) */}
        <TabsContent value="parking">
          <PlacesTabContent
            places={places}
            isLoading={isLoadingPlaces}
            isSupervision={isSupervision}
            selectedParking={currentParking}
            availableNiveaux={availableNiveaux}
            onDeletePlace={(place) =>
              setDeletePlaceState({ isOpen: true, place })
            }
          />
        </TabsContent>

        {/* Contenu Onglet 2 : "Fonctions & Attributions" */}
        <TabsContent value="fonctions">
          <FonctionsTabContent
            fonctions={fonctions}
            isLoading={isLoadingFonctions}
            isSupervision={isSupervision}
            selectedParkingId={selectedParkingId}
            onDeleteFonction={(fonction) =>
              setDeleteFonctionState({ isOpen: true, fonction })
            }
          />
        </TabsContent>
      </Tabs>

      {/* Modale de création / édition d'infrastructure de parking */}
      <ParkingModal
        isOpen={isParkingModalOpen}
        onClose={() => setIsParkingModalOpen(false)}
        onSubmit={handleCreateOrUpdateParking}
        initialData={editingParking}
      />

      {/* Modale d'ajout de place visiteur avec niveaux dynamiques */}
      <PlaceVisiteurModal
        isOpen={isPlaceVisiteurModalOpen}
        onClose={() => setIsPlaceVisiteurModalOpen(false)}
        onSubmit={handleCreatePlaceVisiteur}
        availableNiveaux={availableNiveaux}
        nombreNiveaux={currentParking?.nombre_niveaux ?? 2}
      />

      {/* Modale d'affectation de fonction avec SearchableSelect et niveaux dynamiques */}
      <FonctionCreateModal
        isOpen={isFonctionCreateModalOpen}
        onClose={() => setIsFonctionCreateModalOpen(false)}
        onSubmit={handleCreateFonction}
        selectedParking={currentParking}
        availableNiveaux={availableNiveaux}
        existingFonctions={fonctions.map((f) => f.nom)}
      />

      {/* Confirmation Suppression Infrastructure Parking */}
      <ConfirmModal
        isOpen={deleteParkingState.isOpen}
        onClose={() => setDeleteParkingState({ isOpen: false, parking: null })}
        onConfirm={handleConfirmDeleteParking}
        title="Supprimer le Parking"
        description={`Êtes-vous sûr de vouloir supprimer le parking "${deleteParkingState.parking?.nom}" ? Note : Cette action échouera si des places y sont encore associées.`}
        confirmText="Supprimer le parking"
        variant="destructive"
      />

      {/* Confirmation Suppression Place Visiteur */}
      <ConfirmModal
        isOpen={deletePlaceState.isOpen}
        onClose={() => setDeletePlaceState({ isOpen: false, place: null })}
        onConfirm={handleConfirmDeletePlace}
        title="Supprimer la Place Visiteur"
        description={`Êtes-vous sûr de vouloir supprimer la place visiteur "${deletePlaceState.place?.numero}" ?`}
        confirmText="Supprimer la place"
        variant="destructive"
      />

      {/* Confirmation Suppression Fonction Institutionnelle */}
      <ConfirmModal
        isOpen={deleteFonctionState.isOpen}
        onClose={() =>
          setDeleteFonctionState({ isOpen: false, fonction: null })
        }
        onConfirm={handleConfirmDeleteFonction}
        title="Supprimer la Fonction"
        description={`Êtes-vous sûr de vouloir supprimer la fonction "${deleteFonctionState.fonction?.nom}" ?`}
        confirmText="Supprimer la fonction"
        variant="destructive"
      />
    </div>
  );
}
