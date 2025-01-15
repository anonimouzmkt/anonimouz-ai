import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

interface SidebarNavigationItemProps {
  icon: LucideIcon;
  label: string;
  tooltip: string;
  onClick: () => void;
}

export const SidebarNavigationItem = ({
  icon: Icon,
  label,
  tooltip,
  onClick,
}: SidebarNavigationItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        tooltip={tooltip} 
        onClick={onClick}
        className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 w-full group-data-[collapsible=icon]:justify-center"
      >
        <Link to="#" onClick={(e) => e.preventDefault()}>
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};