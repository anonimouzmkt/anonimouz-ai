import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SecuritySectionProps {
  email: string;
}

export const SecuritySection = ({ email }: SecuritySectionProps) => {
  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;

      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset password email");
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Security</h2>
      <Button variant="outline" onClick={handleResetPassword}>
        Reset Password
      </Button>
    </div>
  );
};