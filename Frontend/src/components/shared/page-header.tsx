import type * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Interface décrivant les propriétés du composant PageHeader.
 */
export interface PageHeaderProps {
  /** Titre principal de la section ou de la page */
  title: string;
  /** Description ou contexte expliquant le rôle de la page */
  description?: string;
  /** Libellé de l'action principale d'ajout (ex: "+ Ajouter une plaque") */
  actionLabel?: string;
  /** Icône illustrant le bouton d'action principal */
  actionIcon?: React.ReactNode;
  /** Callback déclenché lors du clic sur le bouton d'action principal */
  onAction?: () => void;
  /** Indique si le mode supervision est actif (masque automatiquement les actions de création) */
  isSupervision?: boolean;
  /** Composant d'action personnalisé principal (ex: groupe de boutons) */
  action?: React.ReactNode;
  /** Composants ou boutons d'actions secondaires (ex: bouton d'export/impression) */
  extraAction?: React.ReactNode;
}

/**
 * Composant d'en-tête de section standardisé (PageHeader).
 *
 * @param props Props du composant PageHeader {@link PageHeaderProps}
 * @returns L'en-tête de section réutilisable
 */
export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  isSupervision = false,
  action,
  extraAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-border">
      {/* Gauche : Titre et Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-brand tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Droite : Bouton d'action principal ou Extra Actions */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {action}
        {extraAction}

        {actionLabel && !isSupervision && (
          <Button onClick={onAction} size="default" className="shadow-sm">
            {actionIcon}
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
