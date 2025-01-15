import { Settings, LogOut, Shield } from "lucide-react";
import { AccountSwitcher } from "./footer/AccountSwitcher";
import { SidebarFooterButton } from "./footer/SidebarFooterButton";

interface Profile {
  id: string;
  email: string;
}

interface SidebarFooterActionsProps {
  isAdmin: boolean;
  currentUserId: string;
  impersonatedUserId: string;
  profiles?: Profile[];
  handleAccountSwitch: (userId: string) => void;
  handleNavigation: (path: string) => void;
  handleLogout: () => void;
}

export const SidebarFooterActions = ({
  isAdmin,
  currentUserId,
  impersonatedUserId,
  profiles,
  handleAccountSwitch,
  handleNavigation,
  handleLogout,
}: SidebarFooterActionsProps) => {
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <AccountSwitcher
          currentUserId={currentUserId}
          impersonatedUserId={impersonatedUserId}
          profiles={profiles}
          onAccountSwitch={handleAccountSwitch}
        />
      )}
      <SidebarFooterButton
        icon={Settings}
        label="Settings"
        onClick={() => handleNavigation("/settings")}
      />
      {isAdmin && (
        <SidebarFooterButton
          icon={Shield}
          label="Admin"
          onClick={() => handleNavigation("/admin-settings")}
        />
      )}
      <SidebarFooterButton
        icon={LogOut}
        label="Logout"
        onClick={handleLogout}
      />
    </div>
  );
};