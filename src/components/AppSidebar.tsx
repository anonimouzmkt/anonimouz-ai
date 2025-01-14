import { LogOut, MessageSquare, Settings, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="mt-4">
          <SidebarHeader>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/4321434b-2144-462b-b83b-2b1129bccb08.png" 
                  alt="Logo" 
                  className="w-6 h-6"
                />
                <h2 className="text-lg font-semibold text-white">Anonimouz A.I</h2>
              </div>
            </div>
          </SidebarHeader>
          <div className="px-3 py-2">
            <SidebarMenu>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <MessageSquare className="w-4 h-4" />
                    <span>Disparador</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/whatsapp">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/settings">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}