import { LogOut, Settings, User } from "lucide-react";
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
        <div className="mt-20">
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white">Disparo A.I</h2>
            </div>
          </SidebarHeader>
          <div className="px-3 py-2">
            <SidebarMenu>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
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