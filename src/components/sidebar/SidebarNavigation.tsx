import { LayoutGrid, MessageSquare, Kanban, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  handleNavigation: (path: string) => void;
  isAdmin: boolean;
}

export const SidebarNavigation = ({ handleNavigation }: SidebarNavigationProps) => {
  return (
    <SidebarMenu className="mt-8 flex flex-col h-full">
      <div className="px-2 space-y-1">
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Dashboard" 
            onClick={() => handleNavigation("/dispatch-dashboard")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-[#0095FF]/10 w-full group"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <LayoutGrid className="w-5 h-5 text-[#0095FF] group-hover:text-[#0095FF]" />
              <span className="text-white group-hover:text-[#0095FF]">Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="Chat" 
            onClick={() => handleNavigation("/")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-[#0095FF]/10 w-full group"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <MessageSquare className="w-5 h-5 text-[#0095FF] group-hover:text-[#0095FF]" />
              <span className="text-white group-hover:text-[#0095FF]">Chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="KanBan" 
            onClick={() => handleNavigation("/kanban")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-[#0095FF]/10 w-full group"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <Kanban className="w-5 h-5 text-[#0095FF] group-hover:text-[#0095FF]" />
              <span className="text-white group-hover:text-[#0095FF]">KanBan</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip="A.I Agent" 
            onClick={() => handleNavigation("/ai-agent")}
            className="text-base py-3 transition-all duration-200 hover:translate-x-1 hover:bg-[#0095FF]/10 w-full group"
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>
              <Bot className="w-5 h-5 text-[#0095FF] group-hover:text-[#0095FF]" />
              <span className="text-white group-hover:text-[#0095FF]">A.I Agent</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  );
};