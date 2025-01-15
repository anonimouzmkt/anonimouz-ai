import * as React from "react"
import { cn } from "@/lib/utils"

export interface SidebarProps extends React.ComponentProps<"div"> {
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  side?: "left" | "right"
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "sidebar", collapsible = "none", side = "left", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-variant={variant}
        data-collapsible={collapsible}
        data-side={side}
        className={cn(
          "group/sidebar relative z-50 flex h-full min-h-screen w-64 flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-xl transition-[margin,width] duration-300 ease-in-out",
          "data-[variant=floating]:absolute data-[variant=floating]:inset-y-0",
          "data-[variant=inset]:relative data-[variant=inset]:min-h-0 data-[variant=inset]:rounded-lg data-[variant=inset]:shadow-none",
          "data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:data-[collapsible=offcanvas]:-ml-64 data-[side=left]:data-[collapsible=icon]:w-16 data-[side=left]:group-[.sidebar-expanded]/sidebar:ml-0",
          "data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:data-[collapsible=offcanvas]:mr-64 data-[side=right]:data-[collapsible=icon]:w-16 data-[side=right]:group-[.sidebar-expanded]/sidebar:mr-0",
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"