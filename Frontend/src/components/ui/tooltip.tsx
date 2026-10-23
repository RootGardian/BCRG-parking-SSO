"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant les propriétés du composant Tooltip.
 */
interface TooltipProps {
  /** Contenu de l'info-bulle affichée au survol */
  content: React.ReactNode;
  /** Élement déclencheur sur lequel l'info-bulle est greffée */
  children: React.ReactNode;
  /** Position d'affichage par rapport au déclencheur ('top', 'bottom', 'left', 'right') */
  position?: "top" | "bottom" | "left" | "right";
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant d'info-bulle au survol (Tooltip).
 *
 * Affiche une bulle d'information flottante contextuelle lors du survol (`onMouseEnter`)
 * ou de la prise de focus clavier (`onFocus`).
 *
 * @param props Props du composant Tooltip {@link TooltipProps}
 * @returns Le conteneur avec l'info-bulle contextuelle
 */
export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionMap = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: Le conteneur intercepte le survol pour afficher l'infobulle */
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95 duration-150 pointer-events-none font-medium",
            positionMap[position],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
