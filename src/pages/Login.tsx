import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthError } from "@/hooks/useAuthError";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { getErrorMessage } = useAuthError();

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
      
      if (event === "USER_UPDATED") {
        console.log("User updated event received");
      }

      // Clear error on successful events
      if (["SIGNED_IN", "PASSWORD_RECOVERY", "USER_UPDATED"].includes(event)) {
        setError(null);
      }
    });

    // Handle auth state changes for errors
    const handleAuthError = async () => {
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Auth error:", sessionError);
        setError(getErrorMessage(sessionError));
      }
    };

    handleAuthError();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, getErrorMessage]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <LoginHeader />
        <LoginForm error={error} />
      </div>
    </div>
  );
}