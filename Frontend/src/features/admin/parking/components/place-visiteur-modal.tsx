"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type PlaceVisiteurFormValues,
  placeVisiteurSchema,
} from "../schemas/parking-schema";
import type { PlaceVisiteurInput } from "../types";
import { formatNiveauLabel } from "./places-tab-content";

interface PlaceVisiteurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaceVisiteurInput) => Promise<void>;
  availableNiveaux?: string[];
  nombreNiveaux?: number;
}

/**
 * Modale de création d'une nouvelle place de parking dédiée aux visiteurs (PlaceVisiteurModal).
 */
export function PlaceVisiteurModal({
  isOpen,
  onClose,
  onSubmit,
  availableNiveaux = [],
  nombreNiveaux = 2,
}: PlaceVisiteurModalProps) {
  const niveauOptions = React.useMemo(() => {
    if (availableNiveaux.length > 0) {
      return availableNiveaux.map((niv) => ({
        label: formatNiveauLabel(niv),
        value: niv,
      }));
    }
    if (nombreNiveaux > 0) {
      return Array.from({ length: nombreNiveaux }, (_, i) => ({
        label: `Sous-Sol Niveau -${i + 1}`,
        value: `Sous_sol_${i + 1}`,
      }));
    }
    return [
      { label: "Sous-Sol Niveau -1", value: "Sous_sol_1" },
      { label: "Sous-Sol Niveau -2", value: "Sous_sol_2" },
    ];
  }, [availableNiveaux, nombreNiveaux]);

  const defaultNiveau = niveauOptions[0]?.value || "Sous_sol_1";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlaceVisiteurFormValues>({
    resolver: zodResolver(placeVisiteurSchema),
    defaultValues: {
      niveau_parking: defaultNiveau,
      numero_place: "",
    },
  });

  const selectedNiveau = watch("niveau_parking");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        niveau_parking: defaultNiveau,
        numero_place: "",
      });
    }
  }, [isOpen, defaultNiveau, reset]);

  const handleFormSubmit = async (data: PlaceVisiteurFormValues) => {
    await onSubmit({
      niveau_parking: data.niveau_parking,
      numero_place: data.numero_place,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une Place Visiteur"
      description="Créer un nouvel emplacement réservé à l'accueil des visiteurs externes."
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
            className="bg-brand-green-700 hover:bg-brand-green-700/90 text-white font-semibold"
          >
            Créer l&apos;emplacement
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Niveau du Sous-Sol *"
          options={niveauOptions}
          value={selectedNiveau}
          onChange={(e) =>
            setValue("niveau_parking", e.target.value, { shouldValidate: true })
          }
          error={errors.niveau_parking?.message}
        />

        <Input
          label="Numéro de Place *"
          placeholder="ex: V-01, V-02..."
          error={errors.numero_place?.message}
          {...register("numero_place")}
        />
      </form>
    </Dialog>
  );
}
