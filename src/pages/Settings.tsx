import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Key, Copy, Webhook } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AccountSwitcher } from "@/components/AccountSwitcher";

const Settings = () => {
  const [token, setToken] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [impersonatedUserId, setImpersonatedUserId] = useState<string>("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", impersonatedUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const userId = impersonatedUserId || user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile?.webhook_url) {
        setWebhookUrl(profile.webhook_url);
      }

      return profile;
    },
    enabled: !!currentUser,
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

  const handleGetToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setToken(session.access_token);
      toast.success("Token obtido com sucesso!");
    } else {
      toast.error("Não foi possível obter o token");
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Token copiado para a área de transferência!");
    }
  };

  const handleSaveWebhook = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ webhook_url: webhookUrl })
      .eq("id", profile?.id);

    if (error) {
      toast.error("Error saving webhook URL");
      return;
    }

    toast.success("Webhook URL saved successfully!");
    refetch();
  };

  const handleAccountSwitch = (userId: string) => {
    setImpersonatedUserId(userId === currentUser?.id ? "" : userId);
    setToken("");
    refetch();
  };

  if (!profile || !currentUser) return null;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {profile.role === 'admin_user' && (
          <AccountSwitcher
            currentUserId={currentUser.id}
            onAccountSwitch={handleAccountSwitch}
          />
        )}

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
            <Label>Token</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={token} 
                disabled 
                type="password"
                placeholder="Clique no botão para obter o token"
              />
              <Button
                variant="outline"
                onClick={handleGetToken}
              >
                Obter Token
              </Button>
              {token && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToken}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Este é seu token de autorização para fazer requisições à API
            </p>
          </div>

          {profile?.role === 'admin_user' && (
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Enter webhook URL"
                />
                <Button
                  variant="outline"
                  onClick={handleSaveWebhook}
                >
                  <Webhook className="w-4 h-4 mr-2" />
                  Save Webhook
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure the webhook URL for receiving notifications
              </p>
            </div>
          )}

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