import { MessageSquare, MessageCircle, BarChart2 } from "lucide-react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarNavigationItem } from "./navigation/SidebarNavigationItem";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  return (
    <SidebarMenu className="mt-8 flex flex-col h-full space-y-2">
      <div className="px-2 space-y-2">
        <SidebarNavigationItem
          icon={MessageSquare}
          label="Disparador"
          tooltip="Disparador"
          onClick={() => handleNavigation("/")}
        />
        <SidebarNavigationItem
          icon={BarChart2}
          label="Dashboard"
          tooltip="Dashboard"
          onClick={() => handleNavigation("/dispatch-dashboard")}
        />
        <SidebarNavigationItem
          icon={MessageCircle}
          label="WhatsApp"
          tooltip="WhatsApp"
          onClick={() => handleNavigation("/whatsapp")}
        />
      </div>
    </SidebarMenu>
  );
};