"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Calculator,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type ParkingCreateFormValues,
  parkingCreateSchema,
} from "../schemas/parking-schema";
import type { ParkingItem } from "../types";

interface LevelCapacityEntry {
  id: string;
  name: string;
  capacity: number;
}

interface ParkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ParkingCreateFormValues) => Promise<void>;
  initialData?: ParkingItem | null;
}

/**
 * Modale de création ou d'édition d'une infrastructure de parking (ParkingModal).
 * Prend en charge la configuration des parkings avec ou sans niveau (surface)
 * et la répartition détaillée des capacités par niveau (capacites_niveaux).
 */
export function ParkingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ParkingModalProps) {
  const isEditing = Boolean(initialData);

  // État local pour la gestion granulaire des niveaux et de leurs capacités
  const [levelEntries, setLevelEntries] = React.useState<LevelCapacityEntry[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParkingCreateFormValues>({
    resolver: zodResolver(parkingCreateSchema),
    defaultValues: {
      nom: initialData?.nom || "",
      adresse: initialData?.adresse || "",
      nombre_niveaux: initialData?.nombre_niveaux ?? 2,
      capacite_maximale: initialData?.capacite_maximale || undefined,
    },
  });

  const watchedNombreNiveaux = watch("nombre_niveaux");

  // Initialisation à l'ouverture ou au changement d'initialData
  React.useEffect(() => {
    if (!isOpen) return;

    const initialNom = initialData?.nom || "";
    const initialAdresse = initialData?.adresse || "";
    const initialNiveaux = initialData?.nombre_niveaux ?? 2;
    const initialCapacite = initialData?.capacite_maximale || undefined;

    reset({
      nom: initialNom,
      adresse: initialAdresse,
      nombre_niveaux: initialNiveaux,
      capacite_maximale: initialCapacite,
      capacites_niveaux: initialData?.capacites_niveaux || undefined,
    });

    // Reconstitution des niveaux
    if (
      initialData?.capacites_niveaux &&
      Object.keys(initialData.capacites_niveaux).length > 0
    ) {
      const entries: LevelCapacityEntry[] = Object.entries(
        initialData.capacites_niveaux,
      ).map(([name, capacity], idx) => ({
        id: `lvl-${idx}-${Date.now()}`,
        name,
        capacity: Number(capacity) || 0,
      }));
      setLevelEntries(entries);
    } else if (initialNiveaux > 0) {
      const entries: LevelCapacityEntry[] = Array.from(
        { length: initialNiveaux },
        (_, idx) => ({
          id: `lvl-${idx}-${Date.now()}`,
          name: `Sous-sol ${idx + 1}`,
          capacity: Math.floor((initialCapacite || 100) / initialNiveaux),
        }),
      );
      setLevelEntries(entries);
    } else {
      setLevelEntries([]);
    }
  }, [isOpen, initialData, reset]);

  // Synchronise le nombre d'entrées si l'utilisateur modifie "nombre_niveaux"
  const handleNiveauxCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = Math.max(0, Number.parseInt(rawVal, 10) || 0);
    setValue("nombre_niveaux", num, { shouldValidate: true });

    if (num === 0) {
      setLevelEntries([]);
      return;
    }

    setLevelEntries((prev) => {
      if (prev.length === num) return prev;
      if (prev.length < num) {
        const added: LevelCapacityEntry[] = [];
        for (let i = prev.length; i < num; i++) {
          added.push({
            id: `lvl-${i}-${Date.now()}`,
            name: `Sous-sol ${i + 1}`,
            capacity: 50,
          });
        }
        return [...prev, ...added];
      }
      return prev.slice(0, num);
    });
  };

  // Met à jour le libellé d'un niveau
  const handleLevelNameChange = (index: number, newName: string) => {
    setLevelEntries((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], name: newName };
      }
      return copy;
    });
  };

  // Met à jour la capacité d'un niveau
  const handleLevelCapacityChange = (index: number, newCap: number) => {
    setLevelEntries((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], capacity: Math.max(0, newCap) };
      }
      return copy;
    });
  };

  // Supprime un niveau manuellement
  const handleRemoveLevel = (index: number) => {
    setLevelEntries((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setValue("nombre_niveaux", next.length, { shouldValidate: true });
      return next;
    });
  };

  // Ajoute un niveau supplémentaire
  const handleAddLevel = () => {
    setLevelEntries((prev) => {
      const nextIdx = prev.length + 1;
      const next = [
        ...prev,
        {
          id: `lvl-${nextIdx}-${Date.now()}`,
          name: `Sous-sol ${nextIdx}`,
          capacity: 50,
        },
      ];
      setValue("nombre_niveaux", next.length, { shouldValidate: true });
      return next;
    });
  };

  // Calcul et synchronisation de la capacité totale à partir de la somme des niveaux
  const sumLevelCapacities = React.useMemo(() => {
    return levelEntries.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  }, [levelEntries]);

  const handleApplyCalculatedCapacity = () => {
    setValue("capacite_maximale", sumLevelCapacities, { shouldValidate: true });
  };

  // Soumission du formulaire
  const handleFormSubmit = async (values: ParkingCreateFormValues) => {
    const capacitesNiveauxRecord: Record<string, number> = {};
    if (levelEntries.length > 0) {
      for (const entry of levelEntries) {
        const cleanName = entry.name.trim();
        if (cleanName) {
          capacitesNiveauxRecord[cleanName] = entry.capacity || 0;
        }
      }
    }

    const payload: ParkingCreateFormValues = {
      nom: values.nom.trim(),
      adresse: values.adresse?.trim() || undefined,
      nombre_niveaux: Number(values.nombre_niveaux ?? 0),
      capacite_maximale:
        values.capacite_maximale !== undefined &&
        values.capacite_maximale !== null
          ? Number(values.capacite_maximale)
          : levelEntries.length > 0
            ? sumLevelCapacities
            : undefined,
      capacites_niveaux:
        Object.keys(capacitesNiveauxRecord).length > 0
          ? capacitesNiveauxRecord
          : undefined,
    };

    await onSubmit(payload);
    onClose();
  };

  const modalFooter = (
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
        type="submit"
        form="parking-modal-form"
        disabled={isSubmitting}
        className="bg-brand-green-700 hover:bg-brand-green-700/90 text-white text-xs font-semibold shadow-xs"
      >
        {isSubmitting
          ? "Enregistrement..."
          : isEditing
            ? "Enregistrer les modifications"
            : "Créer le parking"}
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-green-700/10 text-brand-green-700">
            <Building2 className="size-5" />
          </div>
          <span>{isEditing ? "Modifier le Parking" : "Nouveau Parking"}</span>
        </div>
      }
      description={
        isEditing
          ? "Mettez à jour les paramètres, le nombre de niveaux et la capacité du parking."
          : "Configurez l'infrastructure de parking, son nombre de niveaux et ses capacités."
      }
      footer={modalFooter}
      maxWidth="lg"
    >
      <form
        id="parking-modal-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4 py-1"
      >
        {/* Ligne 1 : Nom et Adresse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Nom du parking */}
          <div className="space-y-1.5">
            <label
              htmlFor="nom"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Building2 className="size-3.5 text-muted-foreground" />
              Nom du parking <span className="text-brand-red-700">*</span>
            </label>
            <Input
              id="nom"
              placeholder="ex: Parking Principal Sous-Sol"
              {...register("nom")}
              className="bg-background text-sm"
            />
            {errors.nom && (
              <p className="text-xs text-brand-red-700 font-medium">
                {errors.nom.message}
              </p>
            )}
          </div>

          {/* Adresse / Emplacement */}
          <div className="space-y-1.5">
            <label
              htmlFor="adresse"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <MapPin className="size-3.5 text-muted-foreground" />
              Adresse / Emplacement
            </label>
            <Input
              id="adresse"
              placeholder="ex: Siège BCRG Kaloum, Conakry"
              {...register("adresse")}
              className="bg-background text-sm"
            />
            {errors.adresse && (
              <p className="text-xs text-brand-red-700 font-medium">
                {errors.adresse.message}
              </p>
            )}
          </div>
        </div>

        {/* Ligne 2 : Nombre de niveaux et Capacité maximale */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Nombre de niveaux */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nombre_niveaux"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Layers className="size-3.5 text-muted-foreground" />
                Nombre de niveaux
              </label>
              <span className="text-[11px] text-muted-foreground">
                (0 = parking de surface)
              </span>
            </div>
            <Input
              id="nombre_niveaux"
              type="number"
              min={0}
              placeholder="2"
              value={
                watchedNombreNiveaux !== undefined ? watchedNombreNiveaux : ""
              }
              onChange={handleNiveauxCountChange}
              className="bg-background text-sm font-mono"
            />
            {errors.nombre_niveaux && (
              <p className="text-xs text-brand-red-700 font-medium">
                {errors.nombre_niveaux.message}
              </p>
            )}
          </div>

          {/* Capacité maximale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="capacite_maximale"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Maximize2 className="size-3.5 text-muted-foreground" />
                Capacité totale (places)
              </label>
              {levelEntries.length > 0 && sumLevelCapacities > 0 && (
                <button
                  type="button"
                  onClick={handleApplyCalculatedCapacity}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green-700 hover:underline cursor-pointer"
                  title="Appliquer la somme des niveaux"
                >
                  <Calculator className="size-3" />
                  Somme : {sumLevelCapacities} pl.
                </button>
              )}
            </div>
            <Input
              id="capacite_maximale"
              type="number"
              min={0}
              placeholder="150"
              {...register("capacite_maximale", { valueAsNumber: true })}
              className="bg-background text-sm font-mono"
            />
            {errors.capacite_maximale && (
              <p className="text-xs text-brand-red-700 font-medium">
                {errors.capacite_maximale.message}
              </p>
            )}
          </div>
        </div>

        {/* Section Niveaux & Répartition des capacités (capacites_niveaux) */}
        <div className="pt-2">
          {watchedNombreNiveaux === 0 ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-yellow-500/30 bg-brand-yellow-500/10 text-xs text-foreground">
              <Info className="size-4 text-brand-yellow-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">
                  Parking de surface / cour extérieure
                </span>
                Ce parking est configuré sans étage souterrain. La capacité
                s&apos;applique directement sur la surface globale.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-xl border border-border bg-secondary/30 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-brand-green-700" />
                    Répartition des capacités par niveau
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Définissez le libellé et le nombre de places pour chaque
                    niveau.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLevel}
                  className="h-7 text-xs gap-1 border-border bg-card hover:bg-accent"
                >
                  <Plus className="size-3" />
                  Ajouter un niveau
                </Button>
              </div>

              {levelEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2 text-center">
                  Aucun niveau configuré. Cliquez sur &quot;Ajouter un
                  niveau&quot; ci-dessus.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {levelEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg"
                    >
                      <span className="text-xs font-mono font-semibold text-muted-foreground w-6 text-center">
                        #{idx + 1}
                      </span>

                      {/* Libellé du niveau */}
                      <Input
                        value={entry.name}
                        onChange={(e) =>
                          handleLevelNameChange(idx, e.target.value)
                        }
                        placeholder={`ex: Sous-sol ${idx + 1}`}
                        className="h-8 text-xs bg-background flex-1"
                        aria-label={`Nom du niveau ${idx + 1}`}
                      />

                      {/* Capacité du niveau */}
                      <div className="w-28 flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={entry.capacity}
                          onChange={(e) =>
                            handleLevelCapacityChange(
                              idx,
                              Number.parseInt(e.target.value, 10) || 0,
                            )
                          }
                          className="h-8 text-xs font-mono bg-background text-right"
                          aria-label={`Capacité du niveau ${idx + 1}`}
                        />
                        <span className="text-[11px] text-muted-foreground">
                          pl.
                        </span>
                      </div>

                      {/* Supprimer le niveau */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLevel(idx)}
                        className="size-8 text-muted-foreground hover:text-brand-red-700 cursor-pointer"
                        title="Supprimer ce niveau"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {levelEntries.length > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                  <span className="text-muted-foreground font-medium">
                    Total cumulé des niveaux :
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {sumLevelCapacities} places
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
}
