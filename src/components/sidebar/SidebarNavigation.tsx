import { MessageSquare, MessageCircle, BarChart2, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  const menuItems = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Disparador",
      path: "/",
      tooltip: "Disparador"
    },
    {
      icon: <BarChart2 className="w-4 h-4" />,
      label: "Dashboard",
      path: "/dispatch-dashboard",
      tooltip: "Dashboard"
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: "WhatsApp",
      path: "/whatsapp",
      tooltip: "WhatsApp"
    },
    {
      icon: <ListTodo className="w-4 h-4" />,
      label: "Tasks",
      path: "/tasks",
      tooltip: "Tasks"
    }
  ];

  return (
    <SidebarMenu className="mt-8 flex flex-col h-full">
      <div className="px-2 space-y-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.tooltip}
              onClick={() => handleNavigation(item.path)}
              className="text-sm py-2 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 w-full flex items-center gap-3"
            >
              <Link to="#" onClick={(e) => e.preventDefault()}>
                {item.icon}
                <span className="flex-1">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarMenu>
  );
};