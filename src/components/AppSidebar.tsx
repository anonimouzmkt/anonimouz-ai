import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { NavigationWarningDialog } from "./NavigationWarningDialog";
import { SidebarHeader as CustomSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarFooterActions } from "./sidebar/SidebarFooterActions";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [impersonatedUserId, setImpersonatedUserId] = useState<string>("");
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

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

  const handleNavigation = (path: string) => {
    if (location.pathname !== "/" || !window.__CONTACTS_LOADED__) {
      navigate(path);
      return;
    }

    setPendingNavigation(path);
  };

  const handleNavigationConfirm = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleNavigationCancel = () => {
    setPendingNavigation(null);
  };

  const isAdmin = profile?.role === 'admin_user';

  return (
    <>
      <Sidebar variant="floating" collapsible="icon" className="border-none border-r border-primary/30 shadow-[1px_0_5px_rgba(0,149,255,0.5)]">
        <SidebarHeader>
          <CustomSidebarHeader />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation 
            handleNavigation={handleNavigation}
            isAdmin={isAdmin}
          />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarFooterActions
            isAdmin={isAdmin}
            currentUserId={currentUser?.id || ''}
            impersonatedUserId={impersonatedUserId}
            profiles={profiles}
            handleAccountSwitch={handleAccountSwitch}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
          />
        </SidebarFooter>
      </Sidebar>

      <NavigationWarningDialog
        isOpen={!!pendingNavigation}
        onConfirm={handleNavigationConfirm}
        onCancel={handleNavigationCancel}
      />
    </>
  );
}