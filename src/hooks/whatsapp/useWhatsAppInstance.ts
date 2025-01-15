import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/whatsapp";
import { useSelectedUser } from "@/components/AppSidebar";

export const useWhatsAppInstance = () => {
  const { selectedUserId } = useSelectedUser();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      return user;
    },
  });

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances", selectedUserId],
    queryFn: async () => {
      console.log("Fetching WhatsApp instances for user:", selectedUserId || currentUser?.id);
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("user_id", selectedUserId || currentUser?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching WhatsApp instances:", error);
        throw error;
      }
      return data as WhatsAppInstance[];
    },
    enabled: !!currentUser,
  });

  return {
    instances,
    refetch,
  };
};