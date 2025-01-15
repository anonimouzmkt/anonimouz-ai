import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (error: AuthError) => {
    try {
      const errorMessage = JSON.parse(error.message);
      switch (errorMessage.code) {
        case "invalid_credentials":
          return t("invalidCredentials");
        case "email_not_confirmed":
          return t("emailNotConfirmed");
        default:
          return errorMessage.message;
      }
    } catch {
      return error.message;
    }
  };

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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("welcomeBack")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("signIn")}</p>
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-xl space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--color-primary))',
                    brandAccent: 'rgb(var(--color-primary))',
                  },
                },
              },
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}