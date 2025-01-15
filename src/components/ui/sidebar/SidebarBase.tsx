import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const sidebarMenuButtonVariants = cva(
  "group/menu-button relative flex w-full select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        sm: "h-7 text-xs",
        md: "h-8 text-sm",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export type SidebarMenuButtonVariants = VariantProps<typeof sidebarMenuButtonVariants>

export interface SidebarProps extends React.ComponentProps<"div"> {
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  side?: "left" | "right"
}