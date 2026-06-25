"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  mobileFullscreen?: boolean
}

function Modal({
  open,
  onOpenChange,
  children,
  className,
  mobileFullscreen = false,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        mobileFullscreen && "p-0 sm:p-4"
      )}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex h-[90vh] w-[70vw] max-h-[90vh] max-w-[70vw] flex-col overflow-hidden rounded-none border border-border bg-background shadow-none",
          mobileFullscreen &&
            "h-dvh w-screen max-h-dvh max-w-none border-0 sm:h-[90vh] sm:w-[70vw] sm:max-h-[90vh] sm:max-w-[70vw] sm:border",
          className
        )}
      >
        <ModalContainer>{children}</ModalContainer>
      </div>
    </div>,
    document.body
  )
}

function ModalContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-container"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ModalHeader({
  className,
  children,
  onClose,
  ...props
}: React.ComponentProps<"div"> & { onClose?: () => void }) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-border px-6 py-3",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  )
}

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

function ModalTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="modal-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ModalForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-form"
      className={cn(
        "my-auto flex w-full min-w-[min(100%,14rem)] max-w-sm flex-col gap-4",
        className
      )}
      {...props}
    />
  )
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

export { Modal, ModalContainer, ModalHeader, ModalTitle, ModalBody, ModalForm, ModalFooter }
