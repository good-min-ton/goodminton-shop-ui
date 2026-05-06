"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  /** Defaults to "dark" since ConfirmDialog is mostly used in admin/store-admin. */
  theme?: "light" | "dark";
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  destructive = false,
  loading = false,
  onConfirm,
  theme = "dark",
}: Readonly<ConfirmDialogProps>) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      theme={theme}
      footer={
        <>
          <Button
            variant={theme === "dark" ? "admin-ghost" : "secondary"}
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p
        className={cn(
          "text-sm",
          theme === "dark" ? "text-admin-text-muted" : "text-stone-600",
        )}
      >
        {description}
      </p>
    </Modal>
  );
}
