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
  return (
    <div className="flex flex-col gap-3">
      {isAdmin && (
        <AccountSwitcherSection 
          currentUserId={currentUserId}
          onAccountSwitch={handleAccountSwitch}
        />
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start hover:bg-accent/50 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square"
        onClick={() => handleNavigation("/settings")}
      >
        <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
      </Button>
      {isAdmin && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start hover:bg-accent/50 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square"
          onClick={() => handleNavigation("/admin-settings")}
        >
          <Shield className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Admin Settings</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start hover:bg-accent/50 group-data-[collapsible=icon]:w-8 group-data-[collapsible-icon]:p-0 group-data-[collapsible=icon]:aspect-square"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
      </Button>
    </div>
  );
};