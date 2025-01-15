import { MessageSquare, MessageCircle, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  return (
    <SidebarMenu className="mt-12 flex flex-col h-full">
      <div>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Disparador" onClick={() => handleNavigation("/")}>
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageSquare className="w-4 h-4" />
              <span>Disparador</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Dashboard" onClick={() => handleNavigation("/dispatch-dashboard")}>
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <BarChart2 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="WhatsApp" onClick={() => handleNavigation("/whatsapp")}>
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  );
};