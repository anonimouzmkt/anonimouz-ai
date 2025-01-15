import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, useSelectedUser } from "../AppSidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const navigate = useNavigate();
  const { selectedUserId } = useSelectedUser();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkAuth();

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
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
};