"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Building2, MapPin } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import {
  type FonctionCreateFormValues,
  fonctionCreateSchema,
} from "../schemas/parking-schema";
import { parkingService } from "../services/parking.service";
import type { FonctionCreateInput, ParkingItem } from "../types";
import { formatNiveauLabel } from "./places-tab-content";

interface FonctionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FonctionCreateInput) => Promise<void>;
  selectedParking?: ParkingItem | null;
  availableNiveaux?: string[];
  existingFonctions?: string[];
}

/**
 * Modale d'attribution d'une place de parking à une fonction institutionnelle (FonctionCreateModal).
 * Utilise SearchableSelect pour les fonctions chargées dynamiquement depuis l'API et un Select basé sur les niveaux du parking actif.
 */
export function FonctionCreateModal({
  isOpen,
  onClose,
  onSubmit,
  selectedParking,
  availableNiveaux = [],
  existingFonctions = [],
}: FonctionCreateModalProps) {
  const [apiFonctions, setApiFonctions] = React.useState<
    SearchableSelectOption[]
  >([]);
  const [isLoadingFonctions, setIsLoadingFonctions] = React.useState(false);

  // Chargement des fonctions réelles depuis l'API (GET /api/v1/admin/fonctions) à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setIsLoadingFonctions(true);
      parkingService
        .getFonctionOptions()
        .then((options) => {
          setApiFonctions(options);
        })
        .finally(() => {
          setIsLoadingFonctions(false);
        });
    }
  }, [isOpen]);

  // Liste fusionnée et dédoublonnée des fonctions réelles issues de l'API
  const fonctionOptions: SearchableSelectOption[] = React.useMemo(() => {
    const map = new Map<string, SearchableSelectOption>();

    // 1. Fonctions réelles issues du backend
    for (const f of apiFonctions) {
      map.set(f.value.toLowerCase(), f);
    }

    // 2. Fonctions existantes passées par le parent
    for (const fName of existingFonctions) {
      const clean = fName.trim();
      if (clean && !map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), {
          value: clean,
          label: clean,
          description: "Fonction ",
        });
      }
    }

    return Array.from(map.values());
  }, [apiFonctions, existingFonctions]);

  // Options dynamiques des niveaux issues du parking sélectionné
  const niveauOptions = React.useMemo(() => {
    // 1. Si le parking est un parking de surface (0 niveau)
    if (selectedParking && selectedParking.nombre_niveaux === 0) {
      return [{ label: "Surface (Cour extérieure)", value: "Surface" }];
    }

    // 2. Si le parking a des capacités par niveau configurées
    if (
      selectedParking?.capacites_niveaux &&
      Object.keys(selectedParking.capacites_niveaux).length > 0
    ) {
      return Object.entries(selectedParking.capacites_niveaux).map(
        ([lvl, cap]) => ({
          label: `${lvl}${cap ? ` (${cap} pl.)` : ""}`,
          value: lvl,
        }),
      );
    }

    // 3. Niveaux dérivés de la page
    if (availableNiveaux.length > 0) {
      return availableNiveaux.map((niv) => ({
        label: formatNiveauLabel(niv),
        value: niv,
      }));
    }

    // 4. Repli si nombre_niveaux est supérieur à 0
    const count = selectedParking?.nombre_niveaux ?? 2;
    if (count > 0) {
      return Array.from({ length: count }, (_, i) => ({
        label: `Sous-sol ${i + 1}`,
        value: `Sous_sol_${i + 1}`,
      }));
    }

    return [
      { label: "Sous-sol 1", value: "Sous_sol_1" },
      { label: "Sous-sol 2", value: "Sous_sol_2" },
    ];
  }, [selectedParking, availableNiveaux]);

  const defaultNiveau = niveauOptions[0]?.value || "Sous_sol_1";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FonctionCreateFormValues>({
    resolver: zodResolver(fonctionCreateSchema),
    defaultValues: {
      nom_fonction: "",
      niveau_parking: defaultNiveau,
      numero_place: "",
    },
  });

  const selectedFonction = watch("nom_fonction");
  const selectedNiveau = watch("niveau_parking");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        nom_fonction: "",
        niveau_parking: defaultNiveau,
        numero_place: "",
      });
    }
  }, [isOpen, defaultNiveau, reset]);

  const handleFormSubmit = async (data: FonctionCreateFormValues) => {
    await onSubmit({
      id_parking: selectedParking?.id,
      nom_fonction: data.nom_fonction,
      niveau_parking: data.niveau_parking,
      numero_place: data.numero_place.trim().toUpperCase(),
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-green-700/10 text-brand-green-700">
            <Award className="size-5" />
          </div>
          <span>Affecter une fonction à une place</span>
        </div>
      }
      description={
        selectedParking
          ? `Réservez un emplacement de parking pour une fonction sur le ${selectedParking.nom}.`
          : "Sélectionnez la fonction BCRG et réservez-lui son emplacement attribué."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="default"
            isLoading={isSubmitting}
            onClick={handleSubmit(handleFormSubmit)}
            className="bg-brand-green-700 hover:bg-brand-green-700/90 text-white font-semibold text-xs shadow-xs"
          >
            Affecter la place
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Rappel du parking de rattachement */}
        {selectedParking && (
          <div className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-brand-green-700 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">
                  {selectedParking.nom}
                </span>
                {selectedParking.adresse && (
                  <span className="text-muted-foreground block text-[11px] truncate">
                    {selectedParking.adresse}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-brand-green-700/10 text-brand-green-700 shrink-0">
              {selectedParking.capacite_maximale
                ? `${selectedParking.capacite_maximale} places`
                : "Parking actif"}
            </span>
          </div>
        )}

        {/* 1. Sélection dynamique avec recherche de la fonction */}
        <SearchableSelect
          label="Fonction *"
          placeholder="Rechercher ou sélectionner une fonction BCRG..."
          searchPlaceholder="Filtrer par titre, direction (ex: Gouverneur, DGFI)..."
          options={fonctionOptions}
          value={selectedFonction}
          onChange={(val) =>
            setValue("nom_fonction", val, { shouldValidate: true })
          }
          isLoading={isLoadingFonctions}
          allowCustomValue={true}
          error={errors.nom_fonction?.message}
        />

        {/* 2. Ligne Niveau du Parking & Numéro de Place */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Niveau du Parking *"
            options={niveauOptions}
            value={selectedNiveau}
            onChange={(e) =>
              setValue("niveau_parking", e.target.value, {
                shouldValidate: true,
              })
            }
            error={errors.niveau_parking?.message}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="numero_place"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <MapPin className="size-3.5 text-muted-foreground" />
              Numéro de Place Attribuée *
            </label>
            <Input
              id="numero_place"
              placeholder="ex: P-01, P-02, VIP-1..."
              className="font-mono uppercase text-sm"
              {...register("numero_place")}
            />
            {errors.numero_place && (
              <p className="text-xs text-brand-red-700 font-medium">
                {errors.numero_place.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
