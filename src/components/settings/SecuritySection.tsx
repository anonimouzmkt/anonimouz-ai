import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Security</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={handleResetPassword}>
          <KeyRound className="w-4 h-4 mr-2" />
          Reset Password
        </Button>
      </CardContent>
    </Card>
  );
};