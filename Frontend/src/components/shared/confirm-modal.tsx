"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
}

/**
 * Modale de confirmation réutilisable (ConfirmModal).
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          {variant === "destructive" && (
            <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
          )}
          {variant === "warning" && (
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
          )}
          <span>{title}</span>
        </div>
      }
      description={description}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            autoFocus
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-muted-foreground">
        Cette action sera immédiatement exécutée.
      </div>
    </Dialog>
  );
}
