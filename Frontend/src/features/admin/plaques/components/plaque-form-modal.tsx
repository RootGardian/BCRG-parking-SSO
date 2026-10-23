"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import type { Vehicule } from "@/types/models";
import { type PlaqueFormValues, plaqueSchema } from "../schemas/plaques-schema";
import { plaquesService } from "../services/plaques.service";
import type { PlaqueInput } from "../types";

interface PlaqueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaqueInput) => Promise<void>;
  initialData?: Vehicule | null;
}

/**
 * Dialogue modale de création ou d'édition d'un véhicule de la flotte avec sélection réactive du personnel (PlaqueFormModal).
 */
export function PlaqueFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PlaqueFormModalProps) {
  const isEditing = Boolean(initialData);

  const [personnelOptions, setPersonnelOptions] = React.useState<
    SearchableSelectOption[]
  >([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlaqueFormValues>({
    resolver: zodResolver(plaqueSchema),
    defaultValues: {
      numero_plaque: "",
      marque_modele: "",
      couleur: "",
      matricule_personnel: "",
    },
  });

  const selectedMatricule = watch("matricule_personnel");

  // Charger la liste du personnel pour le SearchableSelect
  React.useEffect(() => {
    if (isOpen) {
      setIsLoadingPersonnel(true);
      plaquesService
        .getPersonnelOptions()
        .then((options) => {
          setPersonnelOptions(options);
        })
        .finally(() => {
          setIsLoadingPersonnel(false);
        });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (initialData) {
      reset({
        numero_plaque: initialData.numero_plaque,
        marque_modele: initialData.marque_modele || "",
        couleur: initialData.couleur || "",
        matricule_personnel:
          initialData.personnel?.utilisateur?.matricule || "",
      });
    } else {
      reset({
        numero_plaque: "",
        marque_modele: "",
        couleur: "",
        matricule_personnel: "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: PlaqueFormValues) => {
    await onSubmit({
      numero_plaque: data.numero_plaque,
      marque_modele: data.marque_modele,
      couleur: data.couleur,
      matricule_personnel: data.matricule_personnel,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier le Véhicule" : "Enregistrer un Véhicule"}
      description={
        isEditing
          ? "Mettre à jour les informations du véhicule sélectionné dans la flotte."
          : "Ajouter une nouvelle immatriculation et la rattacher au membre du personnel correspondant."
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="default"
            isLoading={isSubmitting}
            onClick={handleSubmit(handleFormSubmit)}
          >
            {isEditing
              ? "Enregistrer les modifications"
              : "Ajouter à la flotte"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Plaque d'Immatriculation *"
          placeholder="ex: RC-4821-A"
          error={errors.numero_plaque?.message}
          autoFocus
          {...register("numero_plaque")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Marque & Modèle"
            placeholder="ex: Toyota Land Cruiser"
            error={errors.marque_modele?.message}
            {...register("marque_modele")}
          />

          <Input
            label="Couleur"
            placeholder="ex: Noir Métallisé"
            error={errors.couleur?.message}
            {...register("couleur")}
          />
        </div>

        <SearchableSelect
          label="Propriétaire (Personnel BCRG) *"
          options={personnelOptions}
          value={selectedMatricule || ""}
          isLoading={isLoadingPersonnel}
          error={errors.matricule_personnel?.message}
          placeholder="Rechercher par matricule ou nom de l'agent..."
          searchPlaceholder="Tapez un nom ou un matricule (ex: 2020)..."
          onChange={(val) =>
            setValue("matricule_personnel", val, { shouldValidate: true })
          }
        />
      </form>
    </Dialog>
  );
}
