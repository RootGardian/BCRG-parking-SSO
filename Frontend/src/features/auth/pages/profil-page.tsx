"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, KeyRound, Lock, Shield, User } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { parkingService } from "@/features/admin/parking/services/parking.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "@/features/auth/schemas/change-password-schema";
import { useAuthStore } from "@/shared/store/use-auth-store";

/**
 * Composant de page réelle pour le Profil Utilisateur (ProfilPage).
 *
 * Affiche :
 * 1. La carte des informations personnelles du compte connecté (Lecture seule).
 * 2. Le formulaire de mise à jour sécurisée du mot de passe avec validation Zod.
 *
 * @returns La vue complète du profil
 */
export function ProfilPage() {
  const user = useAuthStore((state) => state.user);
  const { handleChangePassword, isLoading, errorMessage } = useAuth();
  const [parkingName, setParkingName] = React.useState<string | null>(
    user?.parking_nom || user?.agent?.parking?.nom || null,
  );

  React.useEffect(() => {
    if (user?.role === "agent") {
      if (user.parking_nom || user.agent?.parking?.nom) {
        setParkingName(user.parking_nom || user.agent?.parking?.nom || null);
      } else if (user.id_parking) {
        parkingService
          .getParkings()
          .then((list) => {
            const found = list.find((p) => p.id === user.id_parking);
            if (found) setParkingName(found.nom);
          })
          .catch(() => {});
      }
    }
  }, [user]);

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
    }
  };

  const displayName = user
    ? `${user.prenom} ${user.nom}`.trim()
    : "Chargement du profil...";
  const displayMatricule = user?.matricule || "----";
  const displayRole = user?.role || "admin";

  return (
    <div className="space-y-6">
      {/* En-tête de Section */}
      <PageHeader
        title="Mon Profil"
        description="Consultez vos informations personnelles et gérez la sécurité de votre compte."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Carte d'Identité & Informations Utilisateur */}
        <Card className="lg:col-span-1 border-border shadow-xs">
          <CardHeader className="text-center pb-4 border-b border-border">
            <div className="mx-auto mb-3">
              {user ? (
                <Avatar
                  name={displayName}
                  src={user.avatar}
                  size="xl"
                  className="size-20 text-xl font-bold ring-2 ring-brand-green-700/20"
                />
              ) : (
                <Skeleton className="size-20 rounded-full mx-auto" />
              )}
            </div>

            {user ? (
              <>
                <CardTitle className="font-brand text-xl font-bold text-foreground">
                  {displayName}
                </CardTitle>
                <CardDescription className="font-mono text-xs font-semibold text-muted-foreground mt-1">
                  Matricule : {displayMatricule}
                </CardDescription>
              </>
            ) : (
              <div className="space-y-2 py-1">
                <Skeleton className="h-6 w-36 mx-auto" />
                <Skeleton className="h-4 w-28 mx-auto" />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-3">
              <StatusBadge type="role" value={displayRole} />
              <Badge variant="success">Compte Actif</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <User className="size-4 shrink-0 text-brand-green-700 dark:text-emerald-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Matricule
                </p>
                <p className="font-semibold text-foreground font-mono">
                  {displayMatricule}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="size-4 shrink-0 text-brand-green-700 dark:text-emerald-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Rôle Système
                </p>
                <p className="font-semibold text-foreground capitalize">
                  {displayRole}
                </p>
              </div>
            </div>

            {/* Parking assigné pour le rôle Agent */}
            {user?.role === "agent" && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building2 className="size-4 shrink-0 text-brand-green-700 dark:text-emerald-400" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Parking Assigné (Poste Guichet)
                  </p>
                  <p className="font-semibold text-foreground">
                    {parkingName || "Non assigné"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colonne Droite : Formulaire de Changement de Mot de Passe */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2 text-brand-green-700 dark:text-emerald-400">
              <KeyRound className="size-5" />
              <CardTitle className="font-brand text-lg font-bold">
                Sécurité & Mot de Passe
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Modifiez votre mot de passe d'accès. Le nouveau mot de passe doit
              comporter au moins 8 caractères, dont une majuscule, une minuscule
              et un chiffre.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMessage && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3.5 text-xs font-medium text-destructive mb-4">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 max-w-md"
            >
              <Input
                type="password"
                label="Nouveau mot de passe"
                placeholder="••••••••••••"
                leftIcon={<Lock className="size-4" />}
                error={errors.nouveau_mot_de_passe?.message}
                {...register("nouveau_mot_de_passe")}
                autoComplete="new-password"
              />

              <Input
                type="password"
                label="Confirmer le nouveau mot de passe"
                placeholder="••••••••••••"
                leftIcon={<Lock className="size-4" />}
                error={errors.confirmation_mot_de_passe?.message}
                {...register("confirmation_mot_de_passe")}
                autoComplete="new-password"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="md"
                  className="font-semibold"
                  isLoading={isLoading}
                >
                  <KeyRound className="size-4" />
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
