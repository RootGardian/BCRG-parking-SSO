"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type VisiteurEntreeFormValues,
  visiteurEntreeSchema,
} from "../schemas/mouvement-visiteur-schema";
import type {
  MouvementVisiteurEntreeInput,
  VisiteurScanResult,
} from "../types";

interface VisiteurFormCardProps {
  scanResult: VisiteurScanResult | null;
  onValiderEntree: (input: MouvementVisiteurEntreeInput) => Promise<void>;
  onValiderSortie: (
    passageId: number,
    plaque?: string,
    observation?: string,
  ) => void;
  isSubmitting: boolean;
}

/**
 * Formulaire et carte d'action d'enregistrement ou de sortie d'un visiteur externe au guichet vigile (VisiteurFormCard).
 */
export function VisiteurFormCard({
  scanResult,
  onValiderEntree,
  onValiderSortie,
  isSubmitting,
}: VisiteurFormCardProps) {
  const estSurSite = Boolean(scanResult?.est_sur_site);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VisiteurEntreeFormValues>({
    resolver: zodResolver(visiteurEntreeSchema),
    defaultValues: {
      numero_plaque: scanResult?.numero_plaque || "",
      observation: scanResult?.observation || "",
    },
  });

  // Synchroniser le numéro de plaque lors d'une nouvelle recherche
  React.useEffect(() => {
    if (scanResult?.numero_plaque) {
      setValue("numero_plaque", scanResult.numero_plaque, {
        shouldValidate: true,
      });
      setValue("observation", scanResult.observation || "");
    }
  }, [scanResult, setValue]);

  const handleFormSubmit = async (data: VisiteurEntreeFormValues) => {
    if (estSurSite && scanResult?.passage_actif_id) {
      onValiderSortie(
        scanResult.passage_actif_id,
        data.numero_plaque,
        data.observation,
      );
    } else {
      await onValiderEntree({
        type_entree: "visiteur",
        numero_plaque: data.numero_plaque,
        observation: data.observation || undefined,
      });
      reset({
        numero_plaque: "",
        observation: "",
      });
    }
  };

  return (
    <div
      className={`p-5 rounded-xl border shadow-md space-y-4 transition-all ${
        estSurSite
          ? "bg-amber-500/5 border-amber-500/30"
          : "bg-emerald-500/5 border-emerald-500/30"
      }`}
    >
      {/* En-tête Statut d'Emplacement */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge variant={estSurSite ? "gold" : "success"}>
            {estSurSite ? "Actuellement Sur Site" : "Hors Site / Nouvel Accès"}
          </Badge>
          {scanResult?.numero_plaque && (
            <span className="text-xs text-muted-foreground font-mono font-semibold">
              Plaque : {scanResult.numero_plaque}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold font-brand text-foreground">
          {estSurSite ? (
            <>
              <ArrowUpRight className="size-4 text-amber-600" />
              <span>Action Requise : Sortie du Parking Visiteur</span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="size-4 text-emerald-600" />
              <span>Action Requise : Autoriser l&apos;Entrée Visiteur</span>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Plaque d'Immatriculation du Véhicule Visiteur *"
          placeholder="ex: RC-9988-V, GN-4411..."
          error={errors.numero_plaque?.message}
          className="font-mono uppercase text-base font-bold"
          {...register("numero_plaque")}
        />

        <Textarea
          label="Motif de la Visite / Observation (Optionnel)"
          placeholder="Saisir le motif détaillé de la visite (ex: Visiteur du Gouverneur...)"
          rows={3}
          error={errors.observation?.message}
          {...register("observation")}
        />

        {/* Bouton de Validation Dynamique (Entrée ou Sortie) */}
        <div className="pt-2">
          {estSurSite ? (
            <Button
              type="submit"
              variant="default"
              isLoading={isSubmitting}
              className="w-full h-12 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-lg"
            >
              <ArrowUpRight className="size-5" />
              VALIDER LA SORTIE DU PARKING
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              isLoading={isSubmitting}
              className="w-full h-12 text-sm font-bold bg-brand-green-700 hover:bg-brand-green-800 text-white gap-2 shadow-lg"
            >
              <CheckCircle2 className="size-5" />
              VALIDER L&apos;ENTRÉE DANS LE PARKING
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
