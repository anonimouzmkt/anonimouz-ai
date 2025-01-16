import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";

export const useSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { selectedUserId } = useSelectedUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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
        console.log("No user ID available");
        return null;
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

      if (data?.webhook_url !== undefined) {
        console.log("Setting webhook URL from profile:", data.webhook_url);
        setWebhookUrl(data.webhook_url || "");
      }

      return data;
    },
    enabled: !!(selectedUserId || currentUser?.id),
  });

  const { data: adminProfile } = useQuery({
    queryKey: ["adminProfile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      console.log("Fetching admin profile for user:", currentUser.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("role, admin_users")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    const theme = localStorage.getItem("theme") || profile?.theme_color || "dark";
    setIsDarkMode(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [profile?.theme_color]);

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
          title: t("error"),
          description: "Failed to save theme preference.",
          variant: "destructive",
        });
        throw error;
      }

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