import { useWhatsAppInstance } from "./whatsapp/useWhatsAppInstance";
import { useCreateInstance } from "./whatsapp/useCreateInstance";
import { useDeleteInstance } from "./whatsapp/useDeleteInstance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/whatsapp";

export const useWhatsAppInstances = () => {
  const { generateQRCode } = useWhatsAppInstance();
  const { createInstance, isLoading: isCreating } = useCreateInstance();
  const { deleteInstance } = useDeleteInstance();

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("status", "connected");

      if (error) throw error;

      // Ensure the status is one of the allowed values
      return (data || []).map(instance => ({
        ...instance,
        status: validateStatus(instance.status)
      })) as WhatsAppInstance[];
    }
  });

  // Helper function to validate status
  const validateStatus = (status: string | null): WhatsAppInstance['status'] => {
    if (status === "connected" || status === "disconnected" || status === "connecting") {
      return status;
    }
    return "disconnected"; // Default fallback
  };

  return {
    instances,
    createInstance: (name: string) => createInstance(name),
    deleteInstance: (instanceId: string) => deleteInstance(instanceId),
    generateQRCode,
    refetch,
    isCreating
  };
};