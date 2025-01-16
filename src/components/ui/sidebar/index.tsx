import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "./SidebarProvider";
import { SidebarContent, SidebarHeader, SidebarFooter } from "./SidebarComponents";
import { SidebarMenu } from "./SidebarMenu";

export {
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "group/sidebar flex h-full w-60 flex-col gap-4 bg-background data-[collapsible=true]:transition-all data-[collapsible=true]:duration-300 data-[state=closed]:w-[52px]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}