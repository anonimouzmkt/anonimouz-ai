import { MessageSquare, MessageCircle, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  return (
    <SidebarMenu className="flex flex-col h-full">
      {/* Main Navigation Group */}
      <div className="flex-1 flex flex-col items-center gap-2 py-4">
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Disparador" 
            onClick={() => handleNavigation("/")}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-sidebar-accent/70"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageSquare className="w-5 h-5" />
              <span className="sr-only">Disparador</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Dashboard" 
            onClick={() => handleNavigation("/dispatch-dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-sidebar-accent/70"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <BarChart2 className="w-5 h-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="WhatsApp" 
            onClick={() => handleNavigation("/whatsapp")}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-sidebar-accent/70"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageCircle className="w-5 h-5" />
              <span className="sr-only">WhatsApp</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  );
};