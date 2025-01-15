import { useState, createContext, useContext } from "react";
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

// Create context for selected user
export const SelectedUserContext = createContext<{
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
}>({
  selectedUserId: "",
  setSelectedUserId: () => {},
});

export const useSelectedUser = () => useContext(SelectedUserContext);

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

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

  const handleAccountSwitch = async (userId: string) => {
    console.log("Switching to user:", userId);
    setSelectedUserId(userId === currentUser?.id ? "" : userId);
    // Invalidate queries to refresh data for the new user context
    await queryClient.invalidateQueries();
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
    <SelectedUserContext.Provider value={{ selectedUserId, setSelectedUserId }}>
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
            impersonatedUserId={selectedUserId}
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
    </SelectedUserContext.Provider>
  );
}