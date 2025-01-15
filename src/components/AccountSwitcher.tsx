import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  role: string;
}

interface AccountSwitcherProps {
  currentUserId: string;
  onAccountSwitch: (userId: string) => void;
}

export const AccountSwitcher = ({ currentUserId, onAccountSwitch }: AccountSwitcherProps) => {
  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching profiles for account switcher");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "user");

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      return profiles as Profile[];
    },
  });

  const { data: currentProfile } = useQuery({
    queryKey: ["profile", currentUserId],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      if (error) {
        console.error("Error fetching current profile:", error);
        throw error;
      }

      return profile as Profile;
    },
  });

  return (
    <div className="flex items-center gap-2 mb-6">
      <Users className="w-4 h-4" />
      <Select
        value={currentUserId}
        onValueChange={(value) => onAccountSwitch(value)}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select an account">
            {currentProfile?.email || "My Account"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentUserId}>
            {currentProfile?.email || "My Account"}
          </SelectItem>
          {profiles?.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};