import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { AccountInformation } from "@/components/settings/AccountInformation";
import { APITokenSection } from "@/components/settings/APITokenSection";
import { WebhookSection } from "@/components/settings/WebhookSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsContainer } from "@/components/settings/SettingsContainer";
import { useSettings } from "@/hooks/useSettings";

const Settings = () => {
  const { selectedUserId } = useSelectedUser();
  const { t } = useTranslation();
  const { 
    currentUser,
    profile,
    adminProfile,
    webhookUrl,
    setWebhookUrl,
    isDarkMode,
    toggleTheme,
    refetch,
    isError 
  } = useSettings();

  if (isError) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">{t("error")}</h1>
          <p className="mt-2">Please try refreshing the page or logging in again.</p>
        </div>
      </div>
    );
  }

  if (!profile || !currentUser) return null;

  const isAdmin = adminProfile?.role === 'admin_user';
  const userId = selectedUserId || currentUser.id;

  return (
    <SettingsContainer>
      <SettingsHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div className="space-y-6">
        <AccountInformation 
          email={profile.email || ''} 
          uniqueId={profile.unique_id || ''} 
        />

        <LanguageSelector />

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
    </SettingsContainer>
  );
};

export default Settings;