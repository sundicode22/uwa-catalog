import * as React from "react"

import { cn } from "@/lib/utils"

const FormInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function FormInput({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="form-input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:text-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
})

FormInput.displayName = "FormInput"

export { FormInput }
