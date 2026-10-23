import Image from "next/image";

/** Liste statique d'identifiants uniques pour la grille de points décoratifs */
const DECORATIVE_DOTS = Array.from(
  { length: 32 },
  (_, i) => `dot-item-${i + 1}`,
);

/**
 * Composant de présentation du panneau gauche institutionnel de la page de connexion (LoginBrandPanel).
 *
 * Reprend la structure épurée et élégante de la marque BCRG :
 * - Fond vert institutionnel (`bg-primary`).
 * - Formes géométriques décoratives circulaires et grille de points en filigrane.
 * - Grand logo institutionnel BCRG centré et titre de l'application.
 */
export function LoginBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center select-none">
      {/* Halos circulaires décoratifs d'arrière-plan */}
      <div className="absolute -left-20 -top-20 size-80 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -right-16 size-64 rounded-full bg-white/5" />
      <div className="absolute left-1/4 top-1/3 size-40 rounded-full bg-white/8" />

      {/* Zone centrale : Grand Logo BCRG & Titre */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-12">
        <Image
          src="/assets/logo/bcrg_logo_descri_inverse_288.png"
          alt="Logo BCRG"
          width={320}
          height={320}
          className="h-auto w-auto drop-shadow-lg"
          priority
        />

        <h2 className="max-w-xl text-center text-4xl font-bold leading-tight text-primary-foreground font-brand sm:text-5xl">
          Parking BCRG
        </h2>
      </div>

      {/* Grille de points décoratifs en bas à gauche */}
      <div className="absolute bottom-8 left-8 grid grid-cols-8 gap-2">
        {DECORATIVE_DOTS.map((dotId) => (
          <div key={dotId} className="size-1.5 rounded-full bg-accent/40" />
        ))}
      </div>
    </div>
  );
}
