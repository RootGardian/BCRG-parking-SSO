import type { MetadataRoute } from "next";

/**
 * Manifeste Web officiel de l'application PWA.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parking BCRG",
    short_name: "Parking BCRG",
    description:
      "Application de gestion et contrôle d'accès au parking de la Banque Centrale de la République de Guinée",
    start_url: "/login",
    display: "standalone",
    background_color: "#1d433b",
    theme_color: "#1d433b",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
