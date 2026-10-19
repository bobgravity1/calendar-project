import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger
const dropdownMenuItemVariants = cva(
  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-xs font-normal outline-none transition-colors data-highlighted:bg-white/10 data-disabled:pointer-events-none data-disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "text-white",
        destructive: "text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function DropdownMenuContent({ className, align = "start", sideOffset = 4, ...props }: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} sideOffset={sideOffset} className="z-50">
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("min-w-44 overflow-hidden rounded-md bg-[#151620] p-1 text-white shadow-lg ring-1 ring-white/15 outline-none [text-shadow:none]", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, variant, ...props }: MenuPrimitive.Item.Props & VariantProps<typeof dropdownMenuItemVariants>) {
  return <MenuPrimitive.Item data-slot="dropdown-menu-item" className={cn(dropdownMenuItemVariants({ variant, className }))} {...props} />
}

function DropdownMenuLinkItem({ className, variant, ...props }: MenuPrimitive.LinkItem.Props & VariantProps<typeof dropdownMenuItemVariants>) {
  return <MenuPrimitive.LinkItem data-slot="dropdown-menu-link-item" className={cn(dropdownMenuItemVariants({ variant, className }))} {...props} />
}

function DropdownMenuFooter({ className, ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-footer" className={cn("-mx-1 -mb-1 mt-1 border-t border-white/10 bg-black/10 p-1", className)} {...props} />
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuFooter, DropdownMenuItem, DropdownMenuLinkItem, DropdownMenuTrigger }
