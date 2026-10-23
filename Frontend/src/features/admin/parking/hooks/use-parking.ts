"use client";

import * as React from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/utils/error-handler";
import { parkingService } from "../services/parking.service";
import type {
  FonctionCreateInput,
  FonctionItem,
  ParkingCreateInput,
  ParkingItem,
  PlaceParkingItem,
  PlaceVisiteurInput,
} from "../types";

/**
 * Custom hook réactif pour la gestion des parkings, des places et des fonctions BCRG.
 */
export function useParking() {
  const [parkings, setParkings] = React.useState<ParkingItem[]>([]);
  const [selectedParkingId, setSelectedParkingId] = React.useState<
    number | null
  >(null);
  const [places, setPlaces] = React.useState<PlaceParkingItem[]>([]);
  const [fonctions, setFonctions] = React.useState<FonctionItem[]>([]);

  const [isLoadingParkings, setIsLoadingParkings] = React.useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = React.useState(true);
  const [isLoadingFonctions, setIsLoadingFonctions] = React.useState(true);

  // Modale CRUD Infrastructure Parking
  const [isParkingModalOpen, setIsParkingModalOpen] = React.useState(false);
  const [editingParking, setEditingParking] =
    React.useState<ParkingItem | null>(null);
  const [deleteParkingState, setDeleteParkingState] = React.useState<{
    isOpen: boolean;
    parking: ParkingItem | null;
  }>({ isOpen: false, parking: null });

  // Modales de création de place visiteur et de fonction
  const [isPlaceVisiteurModalOpen, setIsPlaceVisiteurModalOpen] =
    React.useState(false);
  const [isFonctionCreateModalOpen, setIsFonctionCreateModalOpen] =
    React.useState(false);

  // Modales de confirmation de suppression (Place / Fonction)
  const [deletePlaceState, setDeletePlaceState] = React.useState<{
    isOpen: boolean;
    place: PlaceParkingItem | null;
  }>({ isOpen: false, place: null });

  const [deleteFonctionState, setDeleteFonctionState] = React.useState<{
    isOpen: boolean;
    fonction: FonctionItem | null;
  }>({ isOpen: false, fonction: null });

  // Chargement de la liste des parkings
  const fetchParkings = React.useCallback(async () => {
    setIsLoadingParkings(true);
    try {
      const data = await parkingService.getParkings();
      setParkings(data);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors du chargement des parkings"),
      );
    } finally {
      setIsLoadingParkings(false);
    }
  }, []);

  // Chargement des places (filtré selon selectedParkingId si spécifié)
  const fetchPlaces = React.useCallback(async () => {
    setIsLoadingPlaces(true);
    try {
      const data = await parkingService.getPlaces(
        selectedParkingId ?? undefined,
      );
      setPlaces(data);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Erreur lors du chargement des places de parking",
        ),
      );
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [selectedParkingId]);

  // Chargement des fonctions (filtré selon selectedParkingId si spécifié)
  const fetchFonctions = React.useCallback(async () => {
    setIsLoadingFonctions(true);
    try {
      const data = await parkingService.getFonctions(
        selectedParkingId ?? undefined,
      );
      setFonctions(data);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Erreur lors du chargement des fonctions"),
      );
    } finally {
      setIsLoadingFonctions(false);
    }
  }, [selectedParkingId]);

  React.useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  React.useEffect(() => {
    fetchPlaces();
    fetchFonctions();
  }, [fetchPlaces, fetchFonctions]);

  // Changement du parking sélectionné
  const handleSelectParking = (id: number | null) => {
    setSelectedParkingId(id);
  };

  // Actions Création / Édition de Parking
  const handleOpenCreateParkingModal = () => {
    setEditingParking(null);
    setIsParkingModalOpen(true);
  };

  const handleOpenEditParkingModal = (parking: ParkingItem) => {
    setEditingParking(parking);
    setIsParkingModalOpen(true);
  };

  const handleCreateOrUpdateParking = async (values: ParkingCreateInput) => {
    try {
      if (editingParking) {
        await parkingService.updateParking(editingParking.id, values);
        toast.success(`Parking "${values.nom}" mis à jour avec succès.`);
      } else {
        const created = await parkingService.createParking(values);
        toast.success(`Parking "${values.nom}" créé avec succès.`);
        setSelectedParkingId(created.id);
      }
      setIsParkingModalOpen(false);
      setEditingParking(null);
      fetchParkings();
      fetchPlaces();
      fetchFonctions();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          editingParking
            ? "Échec de la modification du parking."
            : "Échec de la création du parking.",
        ),
      );
    }
  };

  const handleConfirmDeleteParking = async () => {
    if (!deleteParkingState.parking) return;
    const targetParking = deleteParkingState.parking;
    try {
      await parkingService.deleteParking(targetParking.id);
      toast.success(`Parking "${targetParking.nom}" supprimé avec succès.`);
      if (selectedParkingId === targetParking.id) {
        setSelectedParkingId(null);
      }
      setDeleteParkingState({ isOpen: false, parking: null });
      fetchParkings();
      fetchPlaces();
      fetchFonctions();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Impossible de supprimer ce parking. Assurez-vous qu'aucune place ne lui est associée.",
        ),
      );
    }
  };

  // Actions Place Visiteur
  const handleCreatePlaceVisiteur = async (input: PlaceVisiteurInput) => {
    try {
      await parkingService.createPlaceVisiteur({
        ...input,
        id_parking: input.id_parking ?? selectedParkingId ?? undefined,
      });
      toast.success(
        `Place visiteur ${input.numero_place} (${input.niveau_parking}) ajoutée avec succès.`,
      );
      setIsPlaceVisiteurModalOpen(false);
      fetchPlaces();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Échec lors de l'ajout de la place visiteur"),
      );
    }
  };

  const handleConfirmDeletePlace = async () => {
    if (!deletePlaceState.place) return;
    try {
      await parkingService.deletePlaceVisiteur(deletePlaceState.place.id);
      toast.success(
        `Place ${deletePlaceState.place.numero} supprimée avec succès.`,
      );
      setDeletePlaceState({ isOpen: false, place: null });
      fetchPlaces();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Impossible de supprimer cette place de parking.",
        ),
      );
    }
  };

  // Actions Fonction Institutionnelle
  const handleCreateFonction = async (input: FonctionCreateInput) => {
    try {
      await parkingService.createFonction({
        ...input,
        id_parking: input.id_parking ?? selectedParkingId ?? undefined,
      });
      toast.success(
        `Fonction "${input.nom_fonction}" créée avec attribution de la place ${input.numero_place}.`,
      );
      setIsFonctionCreateModalOpen(false);
      fetchFonctions();
      fetchPlaces();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Échec lors de la création de la fonction"),
      );
    }
  };

  const handleConfirmDeleteFonction = async () => {
    if (!deleteFonctionState.fonction) return;
    try {
      await parkingService.deleteFonction(deleteFonctionState.fonction.id);
      toast.success(
        `Fonction "${deleteFonctionState.fonction.nom}" supprimée avec succès.`,
      );
      setDeleteFonctionState({ isOpen: false, fonction: null });
      fetchFonctions();
      fetchPlaces();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Impossible de supprimer cette fonction."),
      );
    }
  };

  return {
    parkings,
    selectedParkingId,
    places,
    fonctions,
    isLoadingParkings,
    isLoadingPlaces,
    isLoadingFonctions,

    // Modale Parking
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

    // Modales Visiteurs & Fonctions
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

    refetchParkings: fetchParkings,
    refetchPlaces: fetchPlaces,
    refetchFonctions: fetchFonctions,
  };
}
