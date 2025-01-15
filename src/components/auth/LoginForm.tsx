import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  error: string | null;
}

export const LoginForm = ({ error }: LoginFormProps) => {
  return (
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
  );
};