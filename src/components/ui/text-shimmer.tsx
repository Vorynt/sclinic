import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function TextShimmer({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="text-shimmer"
      className={cn(
        "inline-block bg-linear-to-r from-muted-foreground via-foreground to-muted-foreground bg-size-[200%_100%] bg-clip-text text-transparent animate-text-shimmer",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { TextShimmer }
