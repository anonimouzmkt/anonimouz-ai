import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Key, Copy, Webhook, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const [token, setToken] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check if user has a theme preference
    const theme = localStorage.getItem("theme");
    const prefersDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profile?.webhook_url) {
        setWebhookUrl(profile.webhook_url);
      }

      return profile;
    },
    enabled: !!currentUser,
  });

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile?.email || '', {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;

      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset password email");
    }
  };

  const handleGenerateToken = () => {
    const newToken = Math.random().toString(36).substring(2, 15);
    setToken(newToken);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard!");
  };

  const handleSaveWebhookUrl = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_url: webhookUrl })
        .eq("id", currentUser?.id);

      if (error) throw error;

      toast.success("Webhook URL saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Failed to save webhook URL");
    }
  };

  if (!profile || !currentUser) return null;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={profile.email || ''} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Unique ID</label>
                <Input value={profile.unique_id || ''} readOnly />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">API Token</h2>
            <div className="flex gap-2">
              <Input value={token} readOnly placeholder="Generate a token..." />
              <Button onClick={handleGenerateToken}>
                <Key className="w-4 h-4 mr-2" />
                Generate
              </Button>
              {token && (
                <Button variant="outline" onClick={handleCopyToken}>
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {profile.role === 'admin_user' && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Webhook URL</h2>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Enter webhook URL..."
                />
                <Button onClick={handleSaveWebhookUrl}>
                  <Webhook className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Security</h2>
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