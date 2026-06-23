import * as React from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FormInput } from "@/components/ui/form-input"

function SearchInput({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<typeof FormInput> & {
  wrapperClassName?: string
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <FormInput type="search" className={cn("pl-9", className)} {...props} />
    </div>
  )
}

export { SearchInput }
