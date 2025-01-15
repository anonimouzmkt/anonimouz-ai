import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { AccountInformation } from "@/components/settings/AccountInformation";
import { APITokenSection } from "@/components/settings/APITokenSection";
import { WebhookSection } from "@/components/settings/WebhookSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { useSelectedUser } from "@/components/AppSidebar";

const Settings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { selectedUserId } = useSelectedUser();

  useEffect(() => {
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
    queryKey: ["profile", selectedUserId || currentUser?.id],
    queryFn: async () => {
      const userId = selectedUserId || currentUser?.id;
      if (!userId) return null;
      
      console.log("Fetching profile for user:", userId);
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
    enabled: !!(selectedUserId || currentUser?.id),
  });

  const { data: adminProfile } = useQuery({
    queryKey: ["adminProfile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();
      return profile;
    },
    enabled: !!currentUser,
  });

  if (!profile || !currentUser) return null;

  const isAdmin = adminProfile?.role === 'admin_user';
  const userId = selectedUserId || currentUser.id;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>

        <div className="space-y-6">
          <AccountInformation 
            email={profile.email || ''} 
            uniqueId={profile.unique_id || ''} 
          />

          <APITokenSection />

          {isAdmin && (
            <WebhookSection
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              userId={userId}
              refetch={refetch}
            />
          )}

          <SecuritySection email={profile.email || ''} />
        </div>
      </div>
    </div>
  );
};

export default Settings;