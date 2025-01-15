import { LayoutGrid, MessageSquare, Kanban, Bot } from "lucide-react";
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
      icon: MessageSquare,
      text: "Chat",
      path: "/"
    },
    {
      icon: Kanban,
      text: "KanBan",
      path: "/kanban"
    },
    {
      icon: Bot,
      text: "A.I Agent",
      path: "/ai-agent"
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
              className={`text-base py-3 transition-all duration-200 hover:translate-x-1 w-full group
                ${location.pathname === item.path 
                  ? 'bg-[#0095FF] hover:bg-[#0095FF]' 
                  : 'hover:bg-[#0095FF]/10'}`}
            >
              <Link to="#" onClick={(e) => e.preventDefault()}>
                <item.icon className={`w-5 h-5 ${
                  location.pathname === item.path 
                    ? 'text-white' 
                    : 'text-[#0095FF] group-hover:text-[#0095FF]'
                }`} />
                <span className={
                  location.pathname === item.path 
                    ? 'text-white' 
                    : 'text-white group-hover:text-[#0095FF]'
                }>{item.text}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarMenu>
  );
};