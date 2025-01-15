import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/whatsapp";

// Helper function to validate status
const validateStatus = (status: string): "connected" | "disconnected" | "connecting" => {
  if (status === "connected" || status === "disconnected" || status === "connecting") {
    return status;
  }
  return "disconnected"; // Default fallback
};

export const useInstanceStatus = (
  selectedInstance: WhatsAppInstance | null,
  setLocalInstances: React.Dispatch<React.SetStateAction<WhatsAppInstance[]>>
) => {
  const [currentInstance, setCurrentInstance] = useState<WhatsAppInstance | null>(selectedInstance);

  useEffect(() => {
    if (!selectedInstance) return;

    const fetchInstanceStatus = async () => {
      console.log('Checking connection status for instance:', selectedInstance.name);
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("id", selectedInstance.id)
        .single();

      if (error) {
        console.error('Error fetching instance status:', error);
        return;
      }

      if (data) {
        // Transform the data to match WhatsAppInstance type
        const validatedInstance: WhatsAppInstance = {
          ...data,
          status: validateStatus(data.status)
        };

        setLocalInstances(prev => 
          prev.map(inst => 
            inst.id === validatedInstance.id ? validatedInstance : inst
          )
        );
        
        // Update selected instance if status changed
        if (validatedInstance.status !== selectedInstance.status) {
          console.log('Instance status changed:', validatedInstance.status);
          setCurrentInstance(validatedInstance);
        }
      }
    };

    // Check connection status every second
    const statusInterval = setInterval(fetchInstanceStatus, 1000);
    return () => clearInterval(statusInterval);
  }, [selectedInstance]);

  return { currentInstance };
};