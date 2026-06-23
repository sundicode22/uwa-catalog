"use client"

import { Modal, ModalBody, ModalFooter, ModalForm, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  isLoading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader onClose={() => onOpenChange(false)}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalForm>
          <p className="text-sm text-muted-foreground">{description}</p>
        </ModalForm>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
