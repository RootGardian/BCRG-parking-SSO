"use client";

import { Download, QrCode } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/shared/services/api-client";
import { ENDPOINTS } from "@/shared/services/endpoints";

interface QRCodeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  matricule?: string;
  nomComplet?: string;
  fonction?: string;
}

/**
 * Modale d'affichage et de téléchargement authentifié de Badge QR Code (QRCodeViewModal).
 */
export function QRCodeViewModal({
  isOpen,
  onClose,
  matricule,
  nomComplet,
  fonction,
}: QRCodeViewModalProps) {
  const [qrBlobUrl, setQrBlobUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen || !matricule) {
      setQrBlobUrl(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    apiClient
      .get(ENDPOINTS.PERSONNEL.QRCODE(matricule), {
        responseType: "blob",
      })
      .then((response) => {
        if (!isMounted) return;
        const blob = new Blob([response.data], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        setQrBlobUrl(url);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erreur chargement du QR code:", err);
        setHasError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, matricule]);

  const handleDownloadPNG = () => {
    if (!qrBlobUrl) return;
    const link = document.createElement("a");
    link.href = qrBlobUrl;
    link.download = `QRCode_${matricule}_${nomComplet?.replace(/\s+/g, "_") || "Personnel"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !matricule) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title="Badge QR Code Institutionnel"
      description={`QR Code attribué à ${nomComplet || matricule}`}
      footer={
        <div className="flex w-full justify-between items-center">
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!qrBlobUrl || isLoading || hasError}
            onClick={handleDownloadPNG}
            className="gap-2"
          >
            <Download className="size-4" />
            Télécharger PNG
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl border border-border space-y-3">
        <div className="p-3 bg-white rounded-lg shadow-md border border-gray-200 min-h-[200px] min-w-[200px] flex items-center justify-center">
          {isLoading ? (
            <Skeleton className="size-48 rounded-lg" />
          ) : hasError || !qrBlobUrl ? (
            <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground text-xs space-y-1">
              <QrCode className="size-10 text-muted-foreground/50" />
              <span>Impossible de charger le QR Code</span>
            </div>
          ) : (
            <Image
              src={qrBlobUrl}
              alt={`QR Code ${matricule}`}
              width={192}
              height={192}
              className="size-48 object-contain"
              unoptimized
            />
          )}
        </div>
        <div className="text-center space-y-0.5">
          <div className="font-bold text-foreground font-brand text-base">
            {nomComplet}
          </div>
          <div className="font-mono text-xs font-semibold text-muted-foreground">
            Matricule : {matricule}
          </div>
          {fonction && (
            <div className="text-xs text-brand-green-700 font-semibold mt-1">
              {fonction}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
