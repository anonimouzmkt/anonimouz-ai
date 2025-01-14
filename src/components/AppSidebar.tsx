import { LogOut, MessageSquare, Settings, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/4321434b-2144-462b-b83b-2b1129bccb08.png" 
              alt="Logo" 
              className="w-7 h-7"
            />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Anonimouz A.I</span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Disparador">
              <Link to="/">
                <MessageSquare className="w-4 h-4" />
                <span>Disparador</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="WhatsApp">
              <Link to="/whatsapp">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-4">
          <Button variant="outline" size="sm" className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square">
            <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}