import { AccountInformation } from "@/components/settings/AccountInformation";
import { APITokenSection } from "@/components/settings/APITokenSection";
import { WebhookSection } from "@/components/settings/WebhookSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";
import { useTranslation } from "@/hooks/useTranslation";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsContainer } from "@/components/settings/SettingsContainer";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { selectedUserId } = useSelectedUser();
  const { t } = useTranslation();
  const { 
    currentUser,
    profile,
    webhookUrl,
    setWebhookUrl,
    isDarkMode,
    toggleTheme,
    refetch,
    isLoading
  } = useSettings();

  if (isLoading) {
    return (
      <SettingsContainer>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsContainer>
    );
  }

  if (!currentUser || !profile) {
    return (
      <SettingsContainer>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load user profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </SettingsContainer>
    );
  }

  const isAdmin = profile.role === 'admin_user';
  const userId = selectedUserId || currentUser.id;

  return (
    <SettingsContainer>
      <SettingsHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div className="space-y-6">
        <AccountInformation 
          email={profile.email || ''} 
          uniqueId={profile.unique_id} 
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