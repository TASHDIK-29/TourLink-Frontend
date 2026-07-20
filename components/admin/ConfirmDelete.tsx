"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  loading,
  itemName,
  description = "This cannot be undone.",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName: string;
  description?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete this item?" className="max-w-md">
      <div className="flex gap-3 rounded-lg bg-destructive/10 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 text-sm">
          <p className="font-medium break-words">{itemName}</p>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
