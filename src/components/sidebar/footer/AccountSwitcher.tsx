import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  email: string;
}

interface AccountSwitcherProps {
  currentUserId: string;
  impersonatedUserId: string;
  profiles?: Profile[];
  onAccountSwitch: (userId: string) => void;
}

export const AccountSwitcher = ({
  currentUserId,
  impersonatedUserId,
  profiles,
  onAccountSwitch,
}: AccountSwitcherProps) => {
  return (
    <div className="flex items-center gap-2 px-2">
      <Building className="w-4 h-4" />
      <Select
        value={impersonatedUserId || currentUserId}
        onValueChange={onAccountSwitch}
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
  );
};