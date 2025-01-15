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
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching all profiles for account switcher");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

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

  return (
    <div className="flex items-center gap-2 px-2">
      <Users className="w-4 h-4" />
      <Select
        value={currentUserId}
        onValueChange={(value) => {
          console.log("Switching to user:", value);
          onAccountSwitch(value);
        }}
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select an account">
            {currentProfile?.email || "My Account"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value={currentUserId}>
            {currentProfile?.email || "My Account"}
          </SelectItem>
          {profiles?.map((profile) => (
            profile.id !== currentUserId && (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.email}
              </SelectItem>
            )
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}