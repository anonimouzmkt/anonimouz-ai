import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { translations, Language, TranslationKey } from "@/utils/translations";

export const useTranslation = () => {
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
    if (!currentUser) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ language })
      .eq("id", currentUser.id);

    if (error) throw error;
  };

  return {
    t,
    setLanguage,
    currentLanguage: (profile?.language || "en") as Language,
  };
};