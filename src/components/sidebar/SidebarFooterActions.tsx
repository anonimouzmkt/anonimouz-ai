import { Settings, LogOut, Shield, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex items-center gap-2 px-2">
          <Building className="w-4 h-4" />
          <Select
            value={impersonatedUserId || currentUserId}
            onValueChange={handleAccountSwitch}
          >
            <SelectTrigger className="w-full bg-background group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentUserId}>My Account</SelectItem>
              {profiles?.map((profile) => 
                profile.id !== currentUserId && (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.email}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        onClick={() => handleNavigation("/settings")}
      >
        <Settings className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
      </Button>
      {isAdmin && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
          onClick={() => handleNavigation("/admin-settings")}
        >
          <Shield className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Admin Settings</span>
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
      </Button>
    </div>
  );
};