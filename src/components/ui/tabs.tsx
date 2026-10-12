import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { buttonVariants } from "./button"

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center gap-1 rounded-lg p-1 text-sm data-[orientation=vertical]:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        line: "bg-transparent text-inherit",
        "glass-light": "bg-glass-light text-glass shadow-none",
        "glass-dark": "bg-glass-dark text-glass shadow-none",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4 data-[orientation=vertical]:flex-row", className)} {...props} />
}

function TabsList({ className, variant = "default", ...props }: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant, className }))} {...props} />
}

function TabsTrigger({ className, buttonVariant, ...props }: TabsPrimitive.Tab.Props & { buttonVariant?: VariantProps<typeof buttonVariants>["variant"] }) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        buttonVariant ? buttonVariants({ variant: buttonVariant }) : "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent px-3 py-1 text-sm font-medium text-inherit opacity-75 transition-colors outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 data-active:bg-primary data-active:text-primary-foreground data-active:opacity-100 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:data-active:border-b-primary group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-inherit",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
