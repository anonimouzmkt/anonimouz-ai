import { Trash, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppInstance } from "@/types/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { QRCodeDialog } from "./QRCodeDialog";

interface InstanceListProps {
  instances: WhatsAppInstance[];
  onDelete: (instanceId: string) => void;
}

export const InstanceList = ({ instances, onDelete }: InstanceListProps) => {
  const { toast } = useToast();
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string>();
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [localInstances, setLocalInstances] = useState(instances);

  // Effect to refresh instances every second
  useEffect(() => {
    if (!selectedInstance) return;

    const fetchInstanceStatus = async () => {
      console.log('Fetching instance status for:', selectedInstance.name);
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
        setLocalInstances(prev => 
          prev.map(inst => 
            inst.id === data.id ? data : inst
          )
        );
        
        // Update selected instance if status changed
        if (data.status !== selectedInstance.status) {
          setSelectedInstance(data);
        }
      }
    };

    const intervalId = setInterval(fetchInstanceStatus, 1000);
    return () => clearInterval(intervalId);
  }, [selectedInstance]);

  // Update local instances when prop changes
  useEffect(() => {
    setLocalInstances(instances);
  }, [instances]);

  const handleGenerateQR = async (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setIsQRDialogOpen(true);
    await refreshQRCode(instance);
  };

  const refreshQRCode = async (instance: WhatsAppInstance) => {
    setIsLoading(true);
    setQrCodeBase64(undefined);

    try {
      console.log('Getting QR code for instance:', instance.name);
      
      const { data: response, error } = await supabase.functions.invoke(
        'generate-whatsapp-qr',
        {
          body: { instanceName: instance.name }
        }
      );

      if (error) {
        console.error('Error getting QR code:', error);
        throw error;
      }

      console.log('QR code response:', response);

      if (response?.qrcode) {
        setQrCodeBase64(response.qrcode);
      } else {
        throw new Error('No QR code in response');
      }

    } catch (error) {
      console.error('Failed to get QR code:', error);
      toast({
        title: "Error",
        description: "Falha ao obter QR code. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localInstances?.map((instance) => (
          <Card
            key={instance.id}
            className="bg-[#222222] p-4 space-y-2"
          >
            <div className="flex items-center justify-between space-x-2">
              <h3 className="text-lg font-semibold text-white">
                {instance.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    instance.status === "connected"
                      ? "bg-green-500/20 text-green-500"
                      : instance.status === "connecting"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {instance.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleGenerateQR(instance)}
                  className="hover:bg-white/10"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(instance.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <QRCodeDialog
        isOpen={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        qrCodeBase64={qrCodeBase64}
        isLoading={isLoading}
        instanceName={selectedInstance?.name || ""}
        onRefresh={() => selectedInstance && refreshQRCode(selectedInstance)}
        instanceStatus={selectedInstance?.status}
      />
    </>
  );
};