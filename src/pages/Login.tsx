import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Disparador A.I</h2>
          <p className="mt-2 text-gray-400">Faça login para continuar</p>
        </div>
        
        <div className="bg-[#222222] p-8 rounded-lg shadow-xl">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0099ff',
                    brandAccent: '#0088ee',
                    inputBackground: '#333333',
                    inputText: 'white',
                    inputPlaceholder: '#666666',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-[#0099ff] hover:bg-[#0088ee] text-white',
                input: 'bg-[#333333] text-white border-[#444444]',
                label: 'text-gray-300',
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