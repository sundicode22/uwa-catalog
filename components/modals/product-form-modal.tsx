"use client"

import { Modal, ModalBody, ModalForm, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { ProductForm } from "@/components/products/product-form"
import type { ProductFormValues } from "@/components/products/product-form"
import type { Product } from "@/types/domain"

export type { ProductFormValues }

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSubmit: (values: ProductFormValues) => Promise<void>
  isLoading?: boolean
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading,
}: ProductFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader onClose={() => onOpenChange(false)}>
        <ModalTitle>{product ? "Edit Product" : "Add Product"}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalForm className="max-w-md">
          <ProductForm
            product={product}
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (values) => {
              await onSubmit(values)
              onOpenChange(false)
            }}
          />
        </ModalForm>
      </ModalBody>
    </Modal>
  )
}
