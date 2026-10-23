"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "../schemas/change-password-schema";

interface ChangePasswordDialogProps {
  /** Indique si la modale est ouverte */
  open: boolean;
  /** Callback de contrôle d'ouverture */
  onOpenChange?: (open: boolean) => void;
  /** Si true, la modale est en mode obligatoire/bloquant (pas d'annulation possible) */
  isForceModal?: boolean;
}

/**
 * Boîte de dialogue réutilisable pour le changement de mot de passe.
 *
 * Gère deux modes :
 * 1. Mode Forcé (`isForceModal = true`) : Bloque l'accès à l'application en cas de `doit_changer_mdp = true`.
 * 2. Mode Volontaire (`isForceModal = false`) : Déclenché à l'initiative de l'utilisateur via le menu profil.
 */
export function ChangePasswordDialog({
  open,
  onOpenChange,
  isForceModal = false,
}: ChangePasswordDialogProps) {
  const { handleChangePassword, isLoading, errorMessage } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      nouveau_mot_de_passe: "",
      confirmation_mot_de_passe: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    const success = await handleChangePassword(data.nouveau_mot_de_passe);
    if (success) {
      reset();
      onOpenChange?.(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isForceModal && !newOpen) {
      // Empêche la fermeture si la modale est en mode forcé/bloquant
      return;
    }
    if (!newOpen) {
      reset();
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => handleOpenChange(false)}
      showCloseButton={!isForceModal}
      preventClose={isForceModal}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-brand-green-700 dark:text-emerald-400">
          {isForceModal ? (
            <ShieldAlert className="size-6 text-amber-600 dark:text-amber-400" />
          ) : (
            <KeyRound className="size-6" />
          )}
          <span>
            {isForceModal
              ? "Changement de mot de passe obligatoire"
              : "Changer mon mot de passe"}
          </span>
        </div>
      }
      description={
        isForceModal
          ? "Pour des raisons de sécurité, vous devez renouveler votre mot de passe temporaire avant d'accéder à l'application."
          : "Choisissez un nouveau mot de passe fort d'au moins 8 caractères."
      }
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs font-medium text-destructive">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="password"
            label="Nouveau mot de passe"
            placeholder="••••••••••••"
            leftIcon={<Lock className="size-4" />}
            error={errors.nouveau_mot_de_passe?.message}
            {...register("nouveau_mot_de_passe")}
            autoComplete="new-password"
            autoFocus
          />

          <Input
            type="password"
            label="Confirmer le mot de passe"
            placeholder="••••••••••••"
            leftIcon={<Lock className="size-4" />}
            error={errors.confirmation_mot_de_passe?.message}
            {...register("confirmation_mot_de_passe")}
            autoComplete="new-password"
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 pt-4 border-t border-border mt-4">
            {!isForceModal && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto font-semibold"
              isLoading={isLoading}
            >
              Enregistrer le mot de passe
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
