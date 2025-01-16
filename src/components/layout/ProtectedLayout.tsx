import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "../AppSidebar";
import { useSelectedUser, SelectedUserProvider } from "@/components/sidebar/SidebarContext";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const navigate = useNavigate();
  const { selectedUserId } = useSelectedUser();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        navigate("/login");
        return;
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
      } else {
        console.log("Session found:", session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" && !session) {
          console.log("User signed out or token refresh failed");
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Set up impersonation when selectedUserId changes
  useEffect(() => {
    const setupImpersonation = async () => {
      if (selectedUserId) {
        console.log("Setting up impersonation for user:", selectedUserId);
        try {
          const { data, error } = await supabase.functions.invoke('handle-impersonation', {
            body: { impersonatedUserId: selectedUserId },
          });

          if (error) {
            console.error("Error setting up impersonation:", error);
            return;
          }

          console.log("Impersonation setup successful:", data);
        } catch (error) {
          console.error("Failed to setup impersonation:", error);
        }
      }
    };

    setupImpersonation();
  }, [selectedUserId]);

  return (
    <SelectedUserProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-background p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SelectedUserProvider>
  );
};