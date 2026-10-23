"use client";

import { Download, Maximize2, QrCode, ShieldCheck } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface MonBadgeQrCardProps {
  qrCodeBase64?: string | null;
  matricule?: string;
  nomComplet?: string;
  isLoading?: boolean;
}

/**
 * Carte d'affichage du Badge QR Code d'accès sous-sol (MonBadgeQrCard).
 *
 * Permet au personnel de présenter son code QR sur smartphone au vigile
 * ou de le télécharger pour son badge physique.
 */
export function MonBadgeQrCard({
  qrCodeBase64,
  matricule,
  nomComplet,
  isLoading = false,
}: MonBadgeQrCardProps) {
  const [isZoomOpen, setIsZoomOpen] = React.useState(false);

  // Normalisation source image base64
  const qrImageSrc = React.useMemo(() => {
    if (!qrCodeBase64) return null;
    if (qrCodeBase64.startsWith("data:image")) return qrCodeBase64;
    return `data:image/png;base64,${qrCodeBase64}`;
  }, [qrCodeBase64]);

  const handleDownload = () => {
    if (!qrImageSrc) return;
    const a = document.createElement("a");
    a.href = qrImageSrc;
    a.download = `badge-parking-${matricule || "bcrg"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="rounded-xl bg-card border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-green-700/10 text-brand-green-700 dark:text-emerald-400">
              <QrCode className="size-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-sm text-foreground">
                Mon Badge d&apos;Accès QR
              </h3>
              <p className="text-xs text-muted-foreground">
                À présenter à la barrière vigile
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green-700 dark:text-emerald-400 bg-brand-green-700/10 px-2 py-0.5 rounded-full border border-brand-green-700/20">
            <ShieldCheck className="size-3" />
            Actif
          </span>
        </div>

        {/* Aperçu QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/40 border border-border/60">
          {isLoading ? (
            <div className="size-44 rounded-lg bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">
              Affichage du badge...
            </div>
          ) : qrImageSrc ? (
            <button
              type="button"
              className="relative p-3 bg-white rounded-xl shadow-sm border border-border/80 cursor-pointer group text-left"
              onClick={() => setIsZoomOpen(true)}
              title="Cliquer pour agrandir en plein écran"
            >
              <Image
                src={qrImageSrc}
                alt={`Badge QR Code ${matricule || ""}`}
                width={176}
                height={176}
                className="size-44 object-contain rounded"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                <Maximize2 className="size-4" />
                <span>Agrandir</span>
              </div>
            </button>
          ) : (
            <div className="size-44 rounded-lg bg-muted flex flex-col items-center justify-center text-center p-3 text-xs text-muted-foreground gap-1.5">
              <QrCode className="size-8 opacity-40" />
              <span>QR Code affiché</span>
            </div>
          )}

          <div className="mt-3 text-center">
            <p className="font-mono text-xs font-bold text-foreground">
              {matricule && !matricule.includes("undefined")
                ? matricule
                : "Personnel BCRG"}
            </p>
            {nomComplet && !nomComplet.includes("undefined") && (
              <p className="text-[11px] text-muted-foreground">{nomComplet}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsZoomOpen(true)}
            disabled={!qrImageSrc}
            className="flex-1 text-xs gap-1.5"
          >
            <Maximize2 className="size-3.5" />
            <span>Plein Écran</span>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!qrImageSrc}
            className="flex-1 text-xs gap-1.5 bg-brand-green-700 hover:bg-brand-green-700/90 text-white"
          >
            <Download className="size-3.5" />
            <span>Télécharger</span>
          </Button>
        </div>
      </div>

      {/* Modale Plein Écran pour scan au guichet */}
      <Dialog
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        maxWidth="sm"
        title="Badge QR Code Personnel BCRG"
        description="Présentez ce QR Code au vigile pour franchir la barrière d'accès au sous-sol."
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          {qrImageSrc && (
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-brand-green-700">
              <Image
                src={qrImageSrc}
                alt={`Badge QR Code ${matricule || ""}`}
                width={260}
                height={260}
                className="size-64 object-contain rounded-lg"
                unoptimized
              />
            </div>
          )}
          <div className="text-center space-y-0.5">
            <p className="font-brand font-bold text-base text-foreground">
              {nomComplet || "Personnel BCRG"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Matricule : {matricule || "N/A"}
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
