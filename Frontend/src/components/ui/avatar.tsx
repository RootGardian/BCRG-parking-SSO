import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Interface décrivant les propriétés du composant Avatar.
 */
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL de l'image de profil */
  src?: string;
  /** Texte alternatif pour l'image d'avatar */
  alt?: string;
  /** Nom complet servant à générer les initiales de fallback */
  name?: string;
  /** Taille de l'avatar (sm: 32px, md: 40px, lg: 48px, xl: 56px) */
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-14 text-lg",
};

/**
 * Composant Avatar d'affichage d'utilisateur.
 *
 * Tente d'afficher l'image fournie via `src`. En cas d'absence d'image ou d'erreur de chargement,
 * génère automatiquement les initiales du nom complet (`name`).
 *
 * @param props Props du composant Avatar {@link AvatarProps}
 * @returns Le composant d'avatar utilisateur
 */
export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-brand-green-700/10 text-brand-green-700 dark:bg-brand-green-700/30 dark:text-emerald-300 font-bold items-center justify-center select-none shadow-xs",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {src && !hasError ? (
        /* biome-ignore lint/performance/noImgElement: <L'image avatar dynamique externe nécessite un élément img standard avec fallback onError> */
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
