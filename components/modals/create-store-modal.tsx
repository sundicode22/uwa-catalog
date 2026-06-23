"use client"

import { Modal, ModalBody, ModalFooter, ModalForm, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"

export function CreateStoreModal({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void
  isLoading?: boolean
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader onClose={() => onOpenChange(false)}>
        <ModalTitle>Create store</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalForm>
          <FormInput
            placeholder="Store name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </ModalForm>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button disabled={!name.trim() || isLoading} onClick={onSubmit}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
