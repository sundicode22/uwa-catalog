"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Modal, ModalBody, ModalFooter, ModalForm, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Category } from "@/types/domain"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
})

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (values: z.infer<typeof schema>) => Promise<void>
  isLoading?: boolean
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: CategoryFormModalProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    form.reset({ name: category?.name ?? "" })
  }, [category, form, open])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader onClose={() => onOpenChange(false)}>
        <ModalTitle>{category ? "Edit Category" : "Add Category"}</ModalTitle>
      </ModalHeader>
      <Form {...form}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values)
            onOpenChange(false)
          })}
        >
          <ModalBody>
            <ModalForm>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <FormInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalForm>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </Form>
    </Modal>
  )
}
