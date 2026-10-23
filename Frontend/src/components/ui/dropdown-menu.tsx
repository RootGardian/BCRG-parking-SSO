"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant le contexte partagé du DropdownMenu.
 */
interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(
  undefined,
);

/**
 * Composant conteneur racine pour un menu déroulant contextuel (DropdownMenu).
 *
 * Gère la fermeture automatique au clic à l'extérieur ou à la touche Échap.
 *
 * @param props Enfants composant le menu (Trigger et Content)
 */
export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, setIsOpen, containerRef, menuRef }}
    >
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/**
 * Composant déclencheur (Trigger) ouvrant ou fermant le menu déroulant.
 */
export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error("DropdownMenuTrigger must be within DropdownMenu");

  return (
    /* biome-ignore lint/a11y/useSemanticElements: Utilisation d'un div conteneur interactif pour éviter l'erreur HTML de bouton imbriqué */
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        context.setIsOpen((prev) => !prev);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          context.setIsOpen((prev) => !prev);
        }
      }}
      className={cn(
        "cursor-pointer inline-flex items-center text-left bg-transparent border-0 p-0 outline-none select-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Interface des propriétés du panneau de contenu du menu déroulant.
 */
export interface DropdownMenuContentProps {
  children: React.ReactNode;
  /** Alignement horizontal par rapport au déclencheur */
  align?: "left" | "right";
  /** Direction d'ouverture ("top" pour le haut, "bottom" pour le bas, "auto" pour détection dynamique) */
  side?: "top" | "bottom" | "auto";
  className?: string;
}

/**
 * Composant panneau de contenu du menu déroulant (DropdownMenuContent).
 *
 * Utilise un portail React (createPortal) vers document.body avec un positionnement fixe
 * calculé en temps réel par rapport au déclencheur. Cela élimine tout risque de rognage
 * par les conteneurs parents (overflow-hidden, overflow-x-auto des tableaux, etc.).
 *
 * @param props Configuration d'alignement, orientation et items du menu
 */
export function DropdownMenuContent({
  children,
  align = "right",
  side = "auto",
  className,
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error("DropdownMenuContent must be within DropdownMenu");

  const [mounted, setMounted] = React.useState(false);
  const [placement, setPlacement] = React.useState<"top" | "bottom">("bottom");
  const [coords, setCoords] = React.useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (!context.containerRef.current) return;
    const rect = context.containerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });

    if (side !== "auto") {
      setPlacement(side);
      return;
    }

    const viewportSpaceBelow = window.innerHeight - rect.bottom;
    const viewportSpaceAbove = rect.top;

    // Si l'espace sous le déclencheur est restreint (< 220px) et que le haut offre davantage d'espace, ouvrir au-dessus
    if (viewportSpaceBelow < 220 && viewportSpaceAbove > viewportSpaceBelow) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }
  }, [context.containerRef, side]);

  React.useEffect(() => {
    if (!context.isOpen) return;

    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [context.isOpen, updateCoords]);

  if (!context.isOpen || !mounted || !coords) return null;

  const isTop = placement === "top";

  return createPortal(
    <div
      ref={context.menuRef}
      style={{
        position: "fixed",
        zIndex: 9999,
        ...(isTop
          ? { bottom: `${Math.max(8, window.innerHeight - coords.top + 6)}px` }
          : { top: `${coords.bottom + 6}px` }),
        ...(align === "right"
          ? { right: `${Math.max(8, window.innerWidth - coords.right)}px` }
          : { left: `${Math.max(8, coords.left)}px` }),
      }}
      className={cn(
        "min-w-[13rem] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl text-foreground",
        isTop
          ? "animate-in fade-in-80 slide-in-from-bottom-2"
          : "animate-in fade-in-80 slide-in-from-top-2",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

/**
 * Composant élément d'action individuel dans le menu (DropdownMenuItem).
 */
export function DropdownMenuItem({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onClick?.();
    context?.setIsOpen(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Composant de libellé d'en-tête de section dans le menu (DropdownMenuLabel).
 */
export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Composant d'élément séparateur horizontal dans le menu (DropdownMenuSeparator).
 */
export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}
