"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { parkingService } from "@/features/admin/parking/services/parking.service";
import type { ParkingItem } from "@/features/admin/parking/types";
import type { RoleEnum, Utilisateur } from "@/types/models";
import {
  type UtilisateurFormValues,
  utilisateurSchema,
} from "../schemas/utilisateurs-schema";
import type { UtilisateurInput } from "../types";

interface UtilisateurFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UtilisateurInput) => Promise<void>;
  initialData?: Utilisateur | null;
  parkings?: ParkingItem[];
}

/**
 * Dialogue modale de création ou d'édition d'un utilisateur du système (UtilisateurFormModal).
 */
export function UtilisateurFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parkings: propParkings = [],
}: UtilisateurFormModalProps) {
  const isEditing = Boolean(initialData);
  const [internalParkings, setInternalParkings] = React.useState<ParkingItem[]>(
    [],
  );

  React.useEffect(() => {
    if (isOpen && propParkings.length === 0) {
      parkingService
        .getParkings()
        .then(setInternalParkings)
        .catch(() => {});
    }
  }, [isOpen, propParkings.length]);

  const parkings = propParkings.length > 0 ? propParkings : internalParkings;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UtilisateurFormValues>({
    resolver: zodResolver(utilisateurSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      matricule: "",
      role: "agent",
      id_parking: null,
    },
  });

  const selectedRole = watch("role");
  const selectedParkingId = watch("id_parking");

  React.useEffect(() => {
    if (initialData) {
      const assignedParkingId =
        initialData.id_parking !== undefined && initialData.id_parking !== null
          ? Number(initialData.id_parking)
          : initialData.agent?.id_parking !== undefined &&
              initialData.agent.id_parking !== null
            ? Number(initialData.agent.id_parking)
            : initialData.agent?.parking?.id !== undefined &&
                initialData.agent?.parking?.id !== null
              ? Number(initialData.agent.parking.id)
              : null;

      reset({
        nom: initialData.nom,
        prenom: initialData.prenom,
        matricule: initialData.matricule,
        role: initialData.role,
        id_parking: assignedParkingId,
      });
    } else {
      reset({
        nom: "",
        prenom: "",
        matricule: "",
        role: "agent",
        id_parking: null,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: UtilisateurFormValues) => {
    await onSubmit({
      nom: data.nom,
      prenom: data.prenom,
      matricule: data.matricule,
      role: data.role as RoleEnum,
      id_parking:
        data.role === "agent" &&
        data.id_parking !== null &&
        data.id_parking !== undefined
          ? Number(data.id_parking)
          : null,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? "Modifier le Compte Utilisateur"
          : "Créer un Nouvel Utilisateur"
      }
      description={
        isEditing
          ? "Mettre à jour le profil, le rôle et l'affectation au parking."
          : "Enregistrer un nouveau compte utilisateur avec attribution de rôle et de parking."
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
            className="bg-brand-green-700 hover:bg-brand-green-700/90 text-white font-semibold"
          >
            {isEditing ? "Enregistrer les modifications" : "Créer le compte"}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-lg bg-brand-green-700/10 border border-brand-green-700/20 p-3 text-xs text-brand-green-700 dark:text-emerald-400">
        🔒 <strong>Fédération SSO BCRG HUB :</strong> L&apos;authentification et la conformité des mots de passe sont centralisées sur l&apos;Active Directory de la Banque. Définissez ici les rôles et habilitations opérationnelles pour le Parking.
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom *"
            placeholder="ex: Touré"
            error={errors.nom?.message}
            autoFocus
            {...register("nom")}
          />
          <Input
            label="Prénom(s) *"
            placeholder="ex: Almamy Babara"
            error={errors.prenom?.message}
            {...register("prenom")}
          />
        </div>

        <Input
          label="Matricule *"
          placeholder="ex: 2021"
          disabled={isEditing}
          error={errors.matricule?.message}
          {...register("matricule")}
        />

        <Select
          label="Rôle *"
          value={selectedRole}
          options={[
            {
              label: "Administrateur (Gestion complète)",
              value: "admin",
            },
            {
              label: "Supervision (Audit et tirages)",
              value: "supervision",
            },
            {
              label: "Agent de Sécurité (Guichet Vigile)",
              value: "agent",
            },
            {
              label: "Personnel (Espace individuel)",
              value: "personnel",
            },
          ]}
          error={errors.role?.message}
          onChange={(e) =>
            setValue("role", e.target.value as RoleEnum, {
              shouldValidate: true,
            })
          }
        />

        {/* Sélection du parking assigné pour le rôle Agent */}
        {selectedRole === "agent" && (
          <div className="space-y-1.5 pt-1">
            <Select
              label="Parking Assigné (Guichet Vigile)"
              value={selectedParkingId ? String(selectedParkingId) : ""}
              options={[
                { label: "Aucun parking assigné", value: "" },
                ...parkings.map((p) => ({
                  label: `${p.nom}${p.capacite_maximale ? ` (${p.capacite_maximale} pl.)` : ""}`,
                  value: String(p.id),
                })),
              ]}
              error={errors.id_parking?.message}
              onChange={(e) =>
                setValue(
                  "id_parking",
                  e.target.value ? Number(e.target.value) : null,
                  { shouldValidate: true },
                )
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Détermine le site sous-sol auquel l&apos;agent de sécurité sera
              rattaché pour les contrôles d&apos;entrées et sorties.
            </p>
          </div>
        )}
      </form>
    </Dialog>
  );
}
