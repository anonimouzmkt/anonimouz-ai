import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (type === "email_change" || type === "signup") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token || "",
            type: "email",
          });

          if (error) throw error;
          
          setConfirmed(true);
          toast.success("Email confirmado com sucesso!");
        } catch (error) {
          console.error("Error confirming email:", error);
          toast.error("Erro ao confirmar email. Por favor, tente novamente.");
        }
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {confirmed ? (
            <CheckCircle className="w-16 h-16 text-green-500 animate-scale-in" />
          ) : (
            <MailCheck className="w-16 h-16 text-primary animate-pulse" />
          )}
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            {confirmed ? "Email Confirmado!" : "Confirmando seu email..."}
          </h2>
          <p className="text-muted-foreground">
            {confirmed
              ? "Seu email foi confirmado com sucesso."
              : "Aguarde enquanto confirmamos seu email..."}
          </p>
        </div>

        {confirmed && (
          <div className="mt-8 animate-fade-in">
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailConfirmation;