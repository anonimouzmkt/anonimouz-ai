import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "../AppSidebar";
import { useSelectedUser, SelectedUserProvider } from "@/components/sidebar/SidebarContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const navigate = useNavigate();
  const { selectedUserId, setSelectedUserId } = useSelectedUser();

  // Check auth status and get session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return null;
      }
      return session;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
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
            toast.error("Failed to switch user account");
            setSelectedUserId(""); // Reset selected user on error
            return;
          }

          console.log("Impersonation setup successful:", data);
          toast.success("Successfully switched user account");
        } catch (error) {
          console.error("Failed to setup impersonation:", error);
          toast.error("Failed to switch user account");
          setSelectedUserId(""); // Reset selected user on error
        }
      }
    };

    setupImpersonation();
  }, [selectedUserId, setSelectedUserId]);

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // The useQuery hook will handle navigation
  }

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