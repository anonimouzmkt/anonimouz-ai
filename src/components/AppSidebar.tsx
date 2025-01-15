import { useState } from "react";
import { LogOut, MessageSquare, Settings, MessageCircle, Users, BarChart2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [impersonatedUserId, setImpersonatedUserId] = useState<string>("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      return profile;
    },
    enabled: !!currentUser,
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "user");

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      return profiles;
    },
    enabled: profile?.role === 'admin_user',
  });

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

  const handleAccountSwitch = (userId: string) => {
    setImpersonatedUserId(userId === currentUser?.id ? "" : userId);
  };

  return (
    <Sidebar variant="floating" collapsible="icon" className="border-none border-r border-primary/30 shadow-[1px_0_5px_rgba(0,149,255,0.5)]">
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
        <SidebarMenu className="mt-12">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Disparador">
              <Link to="/">
                <MessageSquare className="w-4 h-4" />
                <span>Disparador</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard">
              <Link to="/dispatch-dashboard">
                <BarChart2 className="w-4 h-4" />
                <span>Dashboard</span>
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
          {profile?.role === 'admin_user' && (
            <div className="flex items-center gap-2 px-2">
              <Users className="w-4 h-4" />
              <Select
                value={impersonatedUserId || currentUser?.id}
                onValueChange={handleAccountSwitch}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentUser?.id}>My Account</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square"
            asChild
          >
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible-icon]:p-0 group-data-[collapsible=icon]:aspect-square"
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