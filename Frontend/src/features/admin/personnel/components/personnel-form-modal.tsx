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
import {
  type PersonnelCreateFormValues,
  personnelCreateSchema,
} from "../schemas/personnel-schema";
import { personnelService } from "../services/personnel.service";
import type { PersonnelCreateInput, PersonnelItem } from "../types";

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonnelCreateInput) => Promise<void>;
  initialData?: PersonnelItem | null;
}

/**
 * Modale de création ou d'édition d'un membre du personnel BCRG (PersonnelFormModal).
 */
export function PersonnelFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PersonnelFormModalProps) {
  const isEditing = Boolean(initialData);

  const [fonctionOptions, setFonctionOptions] = React.useState<
    SearchableSelectOption[]
  >([]);
  const [isLoadingFonctions, setIsLoadingFonctions] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonnelCreateFormValues>({
    resolver: zodResolver(personnelCreateSchema),
      defaultValues: {
      nom: "",
      prenom: "",
      matricule: "",
      email: "",
      fonction: "",
      numero_plaque: "",
    },
  });

  const selectedFonction = watch("fonction");

  // Charger les options de fonctions existantes pour le SearchableSelect
  React.useEffect(() => {
    if (isOpen) {
      setIsLoadingFonctions(true);
      personnelService
        .getFonctionOptions()
        .then((options) => {
          setFonctionOptions(options);
        })
        .finally(() => {
          setIsLoadingFonctions(false);
        });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (initialData) {
      reset({
        nom: initialData.nom,
        prenom: initialData.prenom,
        matricule: initialData.matricule,
        email: initialData.email || "",
        fonction: initialData.fonction || "",
        numero_plaque: "",
      });
    } else {
      reset({
        nom: "",
        prenom: "",
        matricule: "",
        email: "",
        fonction: "",
        numero_plaque: "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: PersonnelCreateFormValues) => {
    await onSubmit({
      nom: data.nom,
      prenom: data.prenom,
      matricule: data.matricule,
      email: data.email ? data.email.trim() : undefined,
      fonction: data.fonction,
      numero_plaque: data.numero_plaque,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? "Modifier un Membre du Personnel"
          : "Créer un Membre du Personnel"
      }
      description={
        isEditing
          ? "Mettre à jour l'identité, l'adresse email et la fonction au sein de la Banque Centrale."
          : "Enregistrer un nouveau personnel."
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
            {isEditing ? "Enregistrer les modifications" : "Créer le personnel"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom *"
            placeholder="ex: Barry"
            error={errors.nom?.message}
            autoFocus
            {...register("nom")}
          />
          <Input
            label="Prénom(s) *"
            placeholder="ex: Mamadou BANO"
            error={errors.prenom?.message}
            {...register("prenom")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Matricule *"
            placeholder="ex: 2004"
            disabled={isEditing}
            error={errors.matricule?.message}
            {...register("matricule")}
          />
          <Input
            label="Adresse Email"
            type="email"
            placeholder="ex: mbano@bcrg-guinee.org"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <SearchableSelect
          label="Fonction"
          options={fonctionOptions}
          value={selectedFonction || ""}
          isLoading={isLoadingFonctions}
          disabled={isEditing}
          error={errors.fonction?.message}
          placeholder="Sélectionner ou saisir une fonction..."
          searchPlaceholder="Rechercher une fonction existante ou en saisir une nouvelle..."
          allowCustomValue={true}
          onChange={(val) =>
            setValue("fonction", val, { shouldValidate: true })
          }
        />

        {!isEditing && (
          <Input
            label="Numéro de Plaque de Véhicule (Optionnel)"
            placeholder="ex: RC-8812-G"
            error={errors.numero_plaque?.message}
            {...register("numero_plaque")}
          />
        )}
      </form>
    </Dialog>
  );
}
