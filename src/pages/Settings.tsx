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
  } = useSettings();

  if (!currentUser) {
    return (
      <SettingsContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </SettingsContainer>
    );
  }

  const isAdmin = adminProfile?.role === 'admin_user';
  const userId = selectedUserId || currentUser.id;

  return (
    <SettingsContainer>
      <SettingsHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div className="space-y-6">
        {profile ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        )}
      </div>
    </SettingsContainer>
  );
};

export default Settings;