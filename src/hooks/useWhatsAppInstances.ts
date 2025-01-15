import { useWhatsAppInstance } from "./whatsapp/useWhatsAppInstance";
import { useCreateInstance } from "./whatsapp/useCreateInstance";
import { useDeleteInstance } from "./whatsapp/useDeleteInstance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWhatsAppInstances = () => {
  const { generateQRCode } = useWhatsAppInstance();
  const { createInstance } = useCreateInstance();
  const { deleteInstance } = useDeleteInstance();

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("status", "connected");

      if (error) throw error;
      return data;
    }
  });

  return {
    instances,
    createInstance,
    deleteInstance,
    generateQRCode,
    refetch,
  };
};