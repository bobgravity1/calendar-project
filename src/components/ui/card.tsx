import * as React from "react"
import { cn } from "cn"
import { Badge } from "./badge"

const cardVariants = {
  default: "bg-card text-card-foreground [text-shadow:none]",
  "glass-dark": "bg-glass-dark text-glass",
  "glass-light": "bg-glass-light text-glass",
  "glass-item": "glass-item text-inherit",
  primary: "bg-primary text-primary-foreground [text-shadow:none]",
  secondary: "bg-secondary text-secondary-foreground [text-shadow:none]",
} as const

function Card({
  className,
  size = "default",
  variant = "default",
  badge,
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm"; variant?: keyof typeof cardVariants; badge?: React.ReactNode }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-lg p-(--card-spacing) text-sm/relaxed [--card-spacing:--spacing(8)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {badge != null && (
        <div data-slot="card-badge" className="absolute top-(--card-spacing) right-(--card-spacing)">
          {React.isValidElement(badge) ? badge : <Badge variant={variant === "glass-dark" || variant === "glass-light" ? "glass-light" : variant === "primary" ? "secondary" : "default"}>{badge}</Badge>}
        </div>
      )}
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 group-has-[>[data-slot=card-badge]]/card:pr-20 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "form" }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-sm font-medium",
        variant === "form" && "text-xl font-semibold text-title",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm/relaxed text-inherit opacity-75 [text-shadow:inherit]", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("min-w-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 border-t border-current/20 py-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
