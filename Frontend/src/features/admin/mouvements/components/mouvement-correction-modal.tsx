"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type CorrectionFormValues,
  correctionSchema,
} from "../schemas/mouvements-schema";
import type { MouvementItem } from "../types";

interface MouvementCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (observation: string) => Promise<void>;
  mouvement?: MouvementItem | null;
}

/**
 * Modale de saisie de correction ou note d'audit sur un passage (MouvementCorrectionModal).
 */
export function MouvementCorrectionModal({
  isOpen,
  onClose,
  onSubmit,
  mouvement,
}: MouvementCorrectionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CorrectionFormValues>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      observation: "",
    },
  });

  React.useEffect(() => {
    if (mouvement) {
      reset({
        observation: mouvement.observation || "",
      });
    } else {
      reset({
        observation: "",
      });
    }
  }, [mouvement, reset]);

  const handleFormSubmit = async (data: CorrectionFormValues) => {
    await onSubmit(data.observation);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Rectifier / Annoter le Passage"
      description={`Ajouter une note administrative ou une correction d'audit sur le mouvement #${mouvement?.id || ""}`}
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
            Enregistrer la note
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/20 border border-border text-xs space-y-1">
          <div className="font-semibold text-foreground">
            Véhicule :{" "}
            <span className="font-mono">
              {mouvement?.vehicule?.numero_plaque}
            </span>
          </div>
          <div className="text-muted-foreground">
            Date d&apos;entrée : {mouvement?.heure_arrivee}
          </div>
        </div>

        <Input
          label="Observation / Motif de Rectification *"
          placeholder="ex: Rectification de l'heure de sortie suite à une coupure réseau..."
          error={errors.observation?.message}
          autoFocus
          {...register("observation")}
        />
      </form>
    </Dialog>
  );
}
