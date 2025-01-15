import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useThemeManager = () => {
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_color')
            .eq('id', user.id)
            .single();

          if (profile?.theme_color) {
            // Remove any existing theme classes
            document.documentElement.classList.remove('light', 'dark');
            // Add the user's preferred theme
            document.documentElement.classList.add(profile.theme_color);
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      }
    };

    // Load theme immediately when the app starts
    loadUserTheme();

    // Also listen for auth state changes to update theme
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadUserTheme();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};