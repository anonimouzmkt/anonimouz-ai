import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Key } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    }
  });

  const handleResetPassword = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    
    if (error) {
      toast.error("Error sending reset password email");
      return;
    }

    toast.success("Reset password email sent!");
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Unique ID</Label>
            <div className="flex items-center gap-2">
              <Input value={profile?.unique_id || ""} disabled />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (profile?.unique_id) {
                    navigator.clipboard.writeText(profile.unique_id);
                    toast.success("Unique ID copied to clipboard!");
                  }
                }}
              >
                <Key className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your unique identifier for external integrations
            </p>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Button variant="outline" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;