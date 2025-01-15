import { LayoutGrid, Server, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutGrid,
      text: "Dashboard",
      path: "/dispatch-dashboard"
    },
    {
      icon: Server,
      text: "Instances",
      path: "/whatsapp"
    },
    {
      icon: Bot,
      text: "Disparo A.I",
      path: "/"
    }
  ];

  return (
    <SidebarMenu className="mt-8 flex flex-col h-full">
      <div className="px-2 space-y-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.text} 
              onClick={() => handleNavigation(item.path)}
              className={`text-base py-3 w-full transition-all duration-200 hover:translate-x-1 group
                ${location.pathname === item.path 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
            >
              <Link to="#" onClick={(e) => e.preventDefault()}>
                <item.icon className={`w-5 h-5 ${
                  location.pathname === item.path 
                    ? 'text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                }`} />
                <span className={
                  location.pathname === item.path 
                    ? 'text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                }>{item.text}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarMenu>
  );
};