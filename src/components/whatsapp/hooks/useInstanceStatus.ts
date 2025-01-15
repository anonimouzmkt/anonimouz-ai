import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Helper function to validate status
const validateStatus = (status: string): "connected" | "disconnected" | "connecting" => {
  if (status === "connected" || status === "disconnected" || status === "connecting") {
    return status;
  }
  return "disconnected"; // Default fallback
};

interface WhatsAppInstancePayload {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

type WhatsAppInstanceChanges = RealtimePostgresChangesPayload<WhatsAppInstancePayload>;

export const useInstanceStatus = (
  selectedInstance: WhatsAppInstance | null,
  setLocalInstances: React.Dispatch<React.SetStateAction<WhatsAppInstance[]>>
) => {
  const [currentInstance, setCurrentInstance] = useState<WhatsAppInstance | null>(selectedInstance);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedInstance) return;

    console.log('Setting up real-time subscription for instance:', selectedInstance.name);

    // Subscribe to real-time updates for instance status
    const channel = supabase
      .channel(`instance-status-${selectedInstance.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_instances',
          filter: `id=eq.${selectedInstance.id}`,
        },
        (payload: WhatsAppInstanceChanges) => {
          console.log('Instance status changed:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const updatedInstance = {
              ...payload.new,
              status: validateStatus(payload.new.status)
            } as WhatsAppInstance;

            setLocalInstances(prev => 
              prev.map(inst => 
                inst.id === updatedInstance.id ? updatedInstance : inst
              )
            );

            // Update current instance if status changed
            if (selectedInstance && updatedInstance.status !== selectedInstance.status) {
              console.log('Updating current instance status:', updatedInstance.status);
              setCurrentInstance(updatedInstance);

              // Show toast for connection status change
              if (updatedInstance.status === 'connected') {
                toast({
                  title: "WhatsApp Connected",
                  description: `Instance ${updatedInstance.name} is now connected`,
                });
              } else if (updatedInstance.status === 'disconnected') {
                toast({
                  title: "WhatsApp Disconnected",
                  description: `Instance ${updatedInstance.name} is now disconnected`,
                  variant: "destructive",
                });
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up instance status subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedInstance, setLocalInstances, toast]);

  return { currentInstance };
};