import { Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSwitcherSection } from "./AccountSwitcherSection";

interface SidebarFooterActionsProps {
  isAdmin: boolean;
  currentUserId: string;
  impersonatedUserId: string;
  profiles?: any[];
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
  console.log("SidebarFooterActions - Current profiles:", profiles);
  console.log("SidebarFooterActions - Current user:", currentUserId);
  console.log("SidebarFooterActions - Impersonated user:", impersonatedUserId);
  console.log("SidebarFooterActions - Is admin:", isAdmin);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {isAdmin && (
        <AccountSwitcherSection 
          currentUserId={currentUserId}
          onAccountSwitch={handleAccountSwitch}
        />
      )}
      <Button 
        variant="ghost" 
        size="icon"
        className="w-10 h-10 rounded-lg"
        onClick={() => handleNavigation("/settings")}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
      
      {isAdmin && (
        <Button 
          variant="ghost" 
          size="icon"
          className="w-10 h-10 rounded-lg"
          onClick={() => handleNavigation("/admin-settings")}
        >
          <Shield className="h-5 w-5" />
          <span className="sr-only">Admin Settings</span>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-lg"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Logout</span>
      </Button>
    </div>
  );
};