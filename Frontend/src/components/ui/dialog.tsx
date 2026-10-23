"use client";

import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant les propriétés du composant Dialog (Modal).
 */
export interface DialogProps {
  /** Indique si la fenêtre modale est ouverte */
  isOpen: boolean;
  /** Callback déclenché pour fermer la fenêtre modale */
  onClose: () => void;
  /** Titre affiché en haut de la fenêtre modale */
  title?: React.ReactNode;
  /** Description ou contexte explicatif sous le titre */
  description?: React.ReactNode;
  /** Contenu du corps de la modale */
  children: React.ReactNode;
  /** Composants du pied de modale (ex: boutons d'action d'annulation et validation) */
  footer?: React.ReactNode;
  /** Classes CSS supplémentaires appliquées à la fenêtre modale */
  className?: string;
  /** Largeur maximale de la boîte de dialogue (sm, md, lg, xl, 2xl) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Affiche ou masque le bouton de fermeture (X) */
  showCloseButton?: boolean;
  /** Empêche la fermeture par Échap ou clic arrière-plan (mode forcé) */
  preventClose?: boolean;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Composant de fenêtre modale accessible (Dialog / Modal) conforme WCAG 2.1 AA.
 *
 * Fonctionnalités incluses :
 * - Piégeage strict du focus clavier (Focus Trap) empêchant toute fuite de la tabulation.
 * - Auto-focus immédiat sur le premier champ interactif à l'ouverture.
 * - Restauration automatique du focus sur l'élément déclencheur à la fermeture.
 * - Attributs ARIA stricts : role="dialog", aria-modal="true", aria-labelledby, aria-describedby.
 * - Overlay d'arrière-plan avec flou artistique (`backdrop-blur`).
 * - Fermeture automatique lors de la pression sur la touche `Échap` (Escape).
 * - Blocage du défilement de l'arrière-plan (`body overflow: hidden`).
 *
 * @param props Props du composant Dialog {@link DialogProps}
 * @returns La modale interactive ou null si fermée
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  maxWidth = "lg",
  showCloseButton = true,
  preventClose = false,
}: DialogProps) {
  const dialogId = React.useId();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  // Mémorisation de l'élément déclencheur et focus initial
  React.useEffect(() => {
    if (!isOpen) return;

    // Sauvegarde de l'élément actif avant ouverture
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Détection et focus sur le premier champ après rendu DOM
    const frameId = window.requestAnimationFrame(() => {
      if (!dialogRef.current) return;

      const focusableElements =
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableElements.length > 0) {
        // Recherche d'un élément avec autoFocus explicite ou premier focusable
        const autoFocusEl = Array.from(focusableElements).find((el) =>
          el.hasAttribute("autofocus"),
        );
        (autoFocusEl || focusableElements[0]).focus();
      } else {
        dialogRef.current.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      // Restauration du focus à la fermeture
      if (triggerRef.current?.focus) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen]);

  // Gestion des touches Escape et Tabulation (Focus Trap)
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Fermeture par Escape
      if (event.key === "Escape" && !preventClose) {
        event.preventDefault();
        onClose();
        return;
      }

      // 2. Piégeage du focus avec Tab / Shift+Tab
      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter(
          (el) => el.offsetParent !== null && !el.hasAttribute("disabled"),
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, preventClose]);

  // Blocage du défilement d'arrière-plan
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!preventClose) {
      onClose();
    }
  };

  const titleId = title ? `dialog-title-${dialogId}` : undefined;
  const descId = description ? `dialog-desc-${dialogId}` : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-in fade-in-0 duration-200"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fermer le dialogue"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-default w-full h-full border-none p-0 m-0"
        onClick={handleBackdropClick}
      />

      {/* Modal Dialog Content */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl transition-all z-50 animate-in zoom-in-95 duration-200 focus-visible:outline-none",
          maxWidthMap[maxWidth],
          className,
        )}
      >
        {/* Close Button */}
        {showCloseButton && !preventClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="absolute right-4 top-4 rounded-lg p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
          >
            <X className="size-5 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Fermer</span>
          </button>
        )}

        {/* Modal Header */}
        {(title || description) && (
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-5">
            {title && (
              <h2
                id={titleId}
                className="text-xl font-bold font-brand text-foreground"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="py-2">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2 mt-6 pt-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
