import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";

interface Profile {
  id: string;
  email: string | null;
  webhook_url: string | null;
  theme_color: string;
  admin_users: boolean | null;
  unique_id: string;
  role: 'admin_user' | 'user';
  language: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { selectedUserId } = useSelectedUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
        throw error;
      }
      if (!user) {
        console.error("No user found");
        throw new Error("User not found");
      }
      console.log("Current user fetched:", user);
      return user;
    },
  });

  const { data: profile, refetch, isLoading: isProfileLoading } = useQuery<Profile>({
    queryKey: ["profile", selectedUserId || currentUser?.id],
    queryFn: async () => {
      const userId = selectedUserId || currentUser?.id;
      if (!userId) {
        console.log("No user ID available");
        throw new Error("No user ID available");
      }
      
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (!data) {
        console.error("No profile found");
        throw new Error("Profile not found");
      }

      console.log("Profile data fetched:", data);
      setWebhookUrl(data.webhook_url || "");
      setIsDarkMode(data.theme_color === "dark");

      return data;
    },
    enabled: !!currentUser?.id || !!selectedUserId,
  });

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode ? "dark" : "light";
      const userId = selectedUserId || currentUser?.id;
      
      if (!userId) {
        console.error("No user ID available for theme toggle");
        return;
      }

      console.log("Updating theme color for user:", userId, "to:", newTheme);
      const { error } = await supabase
        .from("profiles")
        .update({ theme_color: newTheme })
        .eq("id", userId);

      if (error) {
        console.error("Error updating theme:", error);
        toast({
          title: t("error"),
          description: "Failed to save theme preference.",
          variant: "destructive",
        });
        throw error;
      }

      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle("dark", !isDarkMode);

      console.log("Theme color updated successfully");
      toast({
        title: t("success"),
        description: "Theme preference saved.",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (error) {
      console.error("Error in theme toggle:", error);
    }
  };

  // Update theme when profile changes
  useEffect(() => {
    if (profile?.theme_color) {
      const isDark = profile.theme_color === "dark";
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [profile?.theme_color]);

  return {
    currentUser,
    profile,
    webhookUrl,
    setWebhookUrl,
    isDarkMode,
    toggleTheme,
    refetch,
    isLoading: isUserLoading || isProfileLoading,
  };
};