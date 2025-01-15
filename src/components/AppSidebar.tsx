import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NavigationWarningDialog } from "./NavigationWarningDialog";
import { SidebarHeader as CustomSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarFooterActions } from "./sidebar/SidebarFooterActions";
import { SelectedUserContext, useSelectedUser } from "./sidebar/SidebarContext";

export { useSelectedUser };

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const { selectedUserId, setSelectedUserId } = useSelectedUser();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      console.log("Current user:", user);
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      console.log("Fetching profile for user:", currentUser?.id);
      if (!currentUser) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      console.log("User profile:", profile);
      return profile;
    },
    enabled: !!currentUser,
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching all user profiles...");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order('email');

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("All profiles:", profiles);
      return profiles;
    },
    enabled: profile?.admin_users === true,
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

  const handleAccountSwitch = async (userId: string) => {
    console.log("Switching to user:", userId);
    
    if (userId === currentUser?.id) {
      setSelectedUserId("");
    } else {
      setSelectedUserId(userId);
    }
    
    await queryClient.invalidateQueries();
    
    toast({
      title: "Account Switched",
      description: userId === currentUser?.id 
        ? "Switched back to your account" 
        : "Switched to selected user account",
    });
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

  const isAdmin = profile?.admin_users === true;

  useEffect(() => {
    if (selectedUserId) {
      console.log("Selected user changed, invalidating queries...");
      queryClient.invalidateQueries();
    }
  }, [selectedUserId, queryClient]);

  return (
    <Sidebar 
      variant="floating" 
      collapsible="icon" 
      className="border-none bg-[#111111] shadow-[1px_0_5px_rgba(0,149,255,0.5)]"
    >
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
          impersonatedUserId={selectedUserId}
          profiles={profiles}
          handleAccountSwitch={handleAccountSwitch}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
        />
      </SidebarFooter>

      <NavigationWarningDialog
        isOpen={!!pendingNavigation}
        onConfirm={handleNavigationConfirm}
        onCancel={handleNavigationCancel}
      />
    </Sidebar>
  );
}