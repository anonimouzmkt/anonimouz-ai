import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { AccountInformation } from "@/components/settings/AccountInformation";
import { APITokenSection } from "@/components/settings/APITokenSection";
import { WebhookSection } from "@/components/settings/WebhookSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { selectedUserId } = useSelectedUser();
  const { toast } = useToast();

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

  const { data: currentUser, isError: isCurrentUserError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user information. Please try logging in again.",
          variant: "destructive",
        });
        throw error;
      }
      if (!user) throw new Error("User not found");
      return user;
    },
    retry: 1,
  });

  const { data: profile, refetch, isError: isProfileError } = useQuery({
    queryKey: ["profile", selectedUserId || currentUser?.id],
    queryFn: async () => {
      const userId = selectedUserId || currentUser?.id;
      if (!userId) {
        console.error("No user ID available");
        return null;
      }
      
      console.log("Fetching profile for user:", userId);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile information.",
          variant: "destructive",
        });
        throw error;
      }

      // Update webhook URL state when profile is fetched
      if (profile?.webhook_url !== undefined) {
        console.log("Setting webhook URL from profile:", profile.webhook_url);
        setWebhookUrl(profile.webhook_url || "");
      }

      return profile;
    },
    enabled: !!(selectedUserId || currentUser?.id),
    retry: 1,
  });

  const { data: adminProfile, isError: isAdminError } = useQuery({
    queryKey: ["adminProfile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      console.log("Fetching admin profile...");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch admin information.",
          variant: "destructive",
        });
        throw error;
      }

      return profile;
    },
    enabled: !!currentUser,
    retry: 1,
  });

  // Effect to refetch data when selectedUserId changes
  useEffect(() => {
    console.log("Selected user changed in Settings, refetching data...");
    refetch();
  }, [selectedUserId, refetch]);

  // Effect to update webhook URL when profile changes
  useEffect(() => {
    if (profile?.webhook_url !== undefined) {
      console.log("Profile updated, setting webhook URL:", profile.webhook_url);
      setWebhookUrl(profile.webhook_url || "");
    }
  }, [profile]);

  if (isCurrentUserError || isProfileError || isAdminError) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">Error loading settings</h1>
          <p className="mt-2">Please try refreshing the page or logging in again.</p>
        </div>
      </div>
    );
  }

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