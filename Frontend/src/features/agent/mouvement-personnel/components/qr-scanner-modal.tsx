"use client";

import {
  AlertCircle,
  Camera,
  Flashlight,
  RefreshCw,
  ScanLine,
  X,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

/**
 * Joue un signal sonore court et discret (bip) via Web Audio API lors d'un scan réussi.
 */
function playBeepSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Note La5 (880Hz)
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Ignorer si les permissions audio ne sont pas accordées
  }
}

/**
 * Modale de scan QR Code avec caméra mobile ou webcam (QrScannerModal).
 * Conçue pour le guichet vigile et les terminaux mobiles à la barrière de parking.
 */
export function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: QrScannerModalProps) {
  const scannerContainerId = "qr-reader-container";
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [hasTorch, setHasTorch] = React.useState(false);
  const [isTorchOn, setIsTorchOn] = React.useState(false);
  const [currentFacingMode, setCurrentFacingMode] = React.useState<
    "environment" | "user"
  >("environment");

  // Référence d'instance Html5Qrcode
  const scannerRef = React.useRef<unknown | null>(null);
  const videoTrackRef = React.useRef<MediaStreamTrack | null>(null);

  /**
   * Arrêt propre du flux vidéo et destruction du scanner.
   */
  const stopScanner = React.useCallback(async () => {
    try {
      const scanner = scannerRef.current as {
        isScanning?: boolean;
        stop?: () => Promise<void>;
        clear?: () => Promise<void>;
      } | null;

      if (scanner?.isScanning && typeof scanner.stop === "function") {
        await scanner.stop();
      }
      if (scanner && typeof scanner.clear === "function") {
        await scanner.clear();
      }
    } catch {
      // Ignorer l'erreur d'arrêt si déjà fermé
    } finally {
      scannerRef.current = null;
      videoTrackRef.current = null;
      setIsTorchOn(false);
      setHasTorch(false);
    }
  }, []);

  /**
   * Initialisation du scanner caméra via html5-qrcode.
   */
  const startScanner = React.useCallback(async () => {
    if (!isOpen) return;

    setErrorMessage(null);
    setIsInitializing(true);

    try {
      // Import dynamique côté client de Html5Qrcode
      const { Html5Qrcode } = await import("html5-qrcode");

      // Nettoyer l'ancienne instance si présente
      await stopScanner();

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const boxSize = Math.floor(minDim * 0.72);
          return { width: boxSize, height: boxSize };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: currentFacingMode },
        qrConfig,
        (decodedText: string) => {
          // Vibration tactile haptique
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(100);
          }

          // Bip sonore
          playBeepSound();

          // Arrêt et transmission du matricule décodé
          stopScanner().then(() => {
            onScanSuccess(decodedText);
          });
        },
        () => {
          // Erreur de lecture sur une frame : attendu en continu, ne pas alerter l'UI
        },
      );

      // Détection du support de la lampe torche (Flash)
      try {
        const videoElement = document.querySelector(
          `#${scannerContainerId} video`,
        ) as HTMLVideoElement | null;

        if (videoElement?.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          const track = stream.getVideoTracks()[0];
          if (track) {
            videoTrackRef.current = track;
            const capabilities = track.getCapabilities?.() as
              | { torch?: boolean }
              | undefined;
            if (capabilities?.torch) {
              setHasTorch(true);
            }
          }
        }
      } catch {
        setHasTorch(false);
      }

      setIsInitializing(false);
    } catch (err: unknown) {
      setIsInitializing(false);
      const errStr = String(err);
      if (
        errStr.includes("NotAllowedError") ||
        errStr.includes("Permission denied")
      ) {
        setErrorMessage(
          "Accès à la caméra refusé. Veuillez autoriser la caméra dans les paramètres de votre navigateur.",
        );
      } else if (
        errStr.includes("NotFoundError") ||
        errStr.includes("DevicesNotFoundError")
      ) {
        setErrorMessage(
          "Aucune caméra détectée sur cet appareil. Utilisez la saisie manuelle.",
        );
      } else {
        setErrorMessage(
          "Impossible de démarrer la caméra. Vérifiez que la caméra n'est pas utilisée par une autre application.",
        );
      }
    }
  }, [isOpen, currentFacingMode, stopScanner, onScanSuccess]);

  // Démarrer ou arrêter selon l'état d'ouverture
  React.useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  /**
   * Bascule de la lampe torche si disponible.
   */
  const toggleTorch = async () => {
    if (!videoTrackRef.current) return;
    try {
      const nextState = !isTorchOn;
      await videoTrackRef.current.applyConstraints({
        advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
      });
      setIsTorchOn(nextState);
    } catch {
      setHasTorch(false);
    }
  };

  /**
   * Bascule entre caméra avant et caméra arrière.
   */
  const toggleFacingMode = () => {
    setCurrentFacingMode((prev) =>
      prev === "environment" ? "user" : "environment",
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête du Scanner */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-green-700/10 text-brand-green-700">
              <ScanLine className="size-4 shrink-0 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground font-brand">
                Scanner le Badge QR Code
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Cadrez le code QR du personnel
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              stopScanner().then(onClose);
            }}
            className="size-8 rounded-full"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Zone Vidéo & Viseur */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-black flex items-center justify-center overflow-hidden">
          {/* Conteneur d'injection HTML5-QRCode */}
          <div
            id={scannerContainerId}
            className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
          />

          {/* Viseur visuel superposé */}
          {!errorMessage && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative size-60 sm:size-64 rounded-2xl border-2 border-brand-green-700/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Coins renforcés */}
                <div className="absolute -top-1 -left-1 size-5 border-t-4 border-l-4 border-brand-green-700 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 size-5 border-t-4 border-r-4 border-brand-green-700 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 size-5 border-b-4 border-l-4 border-brand-green-700 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 size-5 border-b-4 border-r-4 border-brand-green-700 rounded-br-lg" />

                {/* Ligne laser animée */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-brand-green-700 to-transparent shadow-[0_0_12px_rgba(0,166,81,0.8)] animate-bounce" />
              </div>
            </div>
          )}

          {/* Indicateur de chargement */}
          {isInitializing && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 text-foreground p-4 text-center z-10">
              <RefreshCw className="size-8 text-brand-green-700 animate-spin" />
              <p className="text-xs font-semibold text-foreground">
                Initialisation de la caméra...
              </p>
            </div>
          )}

          {/* Message d'erreur de caméra */}
          {errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card p-6 text-center z-20">
              <div className="p-3 rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="size-8" />
              </div>
              <p className="text-xs font-medium text-destructive max-w-xs leading-relaxed">
                {errorMessage}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startScanner}
                className="mt-2 text-xs"
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>

        {/* Barre d'outils inférieure */}
        <div className="p-3 bg-card border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Bouton Torche / Flash */}
            {hasTorch && (
              <Button
                type="button"
                variant={isTorchOn ? "default" : "outline"}
                size="sm"
                onClick={toggleTorch}
                className={`text-xs gap-1.5 ${
                  isTorchOn
                    ? "bg-brand-yellow-500 hover:bg-brand-yellow-500/90 text-zinc-950 font-bold"
                    : ""
                }`}
              >
                <Flashlight className="size-3.5" />
                <span>{isTorchOn ? "Flash Activé" : "Flash"}</span>
              </Button>
            )}

            {/* Bascule Caméra Avant / Arrière */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFacingMode}
              className="text-xs gap-1.5"
            >
              <Camera className="size-3.5" />
              <span>Changer Caméra</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              stopScanner().then(onClose);
            }}
            className="text-xs text-muted-foreground"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
