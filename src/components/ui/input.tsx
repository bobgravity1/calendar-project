import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

const inputVariants = {
  default: "",
  card: "h-10 rounded-sm border-black/20 bg-white px-3 text-sm text-card-foreground shadow-sm placeholder:text-card-foreground/50 focus-visible:border-primary focus-visible:ring-primary/15 dark:bg-white md:text-sm",
  ghost: "border-white/35 bg-glass-light text-foreground placeholder:text-white/60 focus-visible:border-white/70 focus-visible:ring-white/25 dark:bg-glass-light",
} as const

function Input({ className, type, variant = "default", ...props }: React.ComponentProps<"input"> & { variant?: keyof typeof inputVariants }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full border min-w-0 rounded-none border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        inputVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Input }
