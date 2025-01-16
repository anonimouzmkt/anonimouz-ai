import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSelectedUser } from "../sidebar/SidebarContext";

interface Profile {
  id: string;
  email: string;
  role: string;
  admin_users: boolean;
}

interface AccountSwitcherSectionProps {
  currentUserId: string;
  onAccountSwitch: (userId: string) => void;
}

export function AccountSwitcherSection({ currentUserId, onAccountSwitch }: AccountSwitcherSectionProps) {
  const { selectedUserId } = useSelectedUser();
  
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching all profiles for account switcher");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order('email');

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("Fetched profiles:", profiles);
      return profiles as Profile[];
    },
  });

  const { data: currentProfile } = useQuery({
    queryKey: ["profile", currentUserId],
    queryFn: async () => {
      console.log("Fetching current profile:", currentUserId);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      if (error) {
        console.error("Error fetching current profile:", error);
        throw error;
      }

      console.log("Current profile:", profile);
      return profile as Profile;
    },
    enabled: !!currentUserId,
  });

  // Use selectedUserId if it exists, otherwise use currentUserId
  const effectiveUserId = selectedUserId || currentUserId;

  // Get the profile for the currently selected/impersonated user
  const selectedProfile = profiles?.find(p => p.id === effectiveUserId);

  return (
    <div className="px-2">
      <Select
        value={effectiveUserId}
        onValueChange={(value) => {
          console.log("Switching to user:", value);
          onAccountSwitch(value);
        }}
      >
        <SelectTrigger className="w-full bg-background text-sm py-2 transition-all duration-200 hover:translate-x-1 hover:bg-sidebar-accent/70 flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-2">
          <Users className="w-4 h-4 shrink-0" />
          <SelectValue placeholder="Select an account" className="flex-1 group-data-[collapsible=icon]:hidden">
            {selectedProfile?.email || currentProfile?.email || "My Account"}
            {selectedProfile?.admin_users && " (Admin)"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value={currentUserId}>
            {currentProfile?.email || "My Account"}
            {currentProfile?.admin_users && " (Admin)"}
          </SelectItem>
          {profiles?.map((profile) => (
            profile.id !== currentUserId && (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.email}
                {profile.admin_users && " (Admin)"}
              </SelectItem>
            )
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}