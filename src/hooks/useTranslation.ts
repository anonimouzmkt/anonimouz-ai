import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { translations, Language, TranslationKey } from "@/utils/translations";

export const useTranslation = () => {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      console.log("Fetching profile for translations, user:", currentUser.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      return profile;
    },
    enabled: !!currentUser,
  });

  const t = (key: TranslationKey): string => {
    const language = (profile?.language || "en") as Language;
    return translations[language][key];
  };

  const setLanguage = async (language: Language) => {
    if (!currentUser) {
      console.error("No user found when trying to set language");
      return;
    }
    
    console.log("Setting language to:", language, "for user:", currentUser.id);
    const { error } = await supabase
      .from("profiles")
      .update({ language })
      .eq("id", currentUser.id);

    if (error) {
      console.error("Error updating language:", error);
      throw error;
    }

    // Invalidate profile query to trigger UI update
    await queryClient.invalidateQueries({ queryKey: ["profile", currentUser.id] });
    console.log("Language updated successfully");
  };

  return {
    t,
    setLanguage,
    currentLanguage: (profile?.language || "en") as Language,
  };
};