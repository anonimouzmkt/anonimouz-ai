import { MessageSquare, MessageCircle, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  return (
    <SidebarMenu className="mt-8 flex flex-col h-full space-y-2">
      <div className="px-2 space-y-2">
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Disparador" 
            onClick={() => handleNavigation("/")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 w-full"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageSquare className="w-5 h-5" />
              <span>Disparador</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Dashboard" 
            onClick={() => handleNavigation("/dispatch-dashboard")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 w-full"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <BarChart2 className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="WhatsApp" 
            onClick={() => handleNavigation("/whatsapp")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 w-full"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  );
};