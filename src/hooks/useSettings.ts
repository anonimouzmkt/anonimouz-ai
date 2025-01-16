import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";

export const useSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { selectedUserId } = useSelectedUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);

    try {
      const userId = selectedUserId || currentUser?.id;
      if (!userId) return;

      console.log("Updating theme color for user:", userId, "to:", newTheme);
      const { error } = await supabase
        .from("profiles")
        .update({ theme_color: newTheme })
        .eq("id", userId);

      if (error) {
        console.error("Error updating theme:", error);
        toast({
          title: "Error",
          description: "Failed to save theme preference.",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Theme color updated successfully");
      toast({
        title: "Success",
        description: "Theme preference saved.",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (error) {
      console.error("Error in theme toggle:", error);
    }
  };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
        throw error;
      }
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile, refetch } = useQuery({
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
        throw error;
      }

      if (profile?.webhook_url !== undefined) {
        console.log("Setting webhook URL from profile:", profile.webhook_url);
        setWebhookUrl(profile.webhook_url || "");
      }

      return profile;
    },
    enabled: !!(selectedUserId || currentUser?.id),
    retry: false,
  });

  const { data: adminProfile } = useQuery({
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
        throw error;
      }

      return profile;
    },
    enabled: !!currentUser,
    retry: false,
  });

  useEffect(() => {
    if (profile?.webhook_url !== undefined) {
      console.log("Profile updated, setting webhook URL:", profile.webhook_url);
      setWebhookUrl(profile.webhook_url || "");
    }
  }, [profile]);

  return {
    currentUser,
    profile,
    adminProfile,
    webhookUrl,
    setWebhookUrl,
    isDarkMode,
    toggleTheme,
    refetch,
  };
};