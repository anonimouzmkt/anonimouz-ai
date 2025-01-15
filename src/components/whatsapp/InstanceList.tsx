import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppInstance } from "@/types/whatsapp";
import { QRCodeDialog } from "./QRCodeDialog";
import { InstanceCard } from "./InstanceCard";
import { useInstanceStatus } from "./hooks/useInstanceStatus";

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
  const [localInstances, setLocalInstances] = useState<WhatsAppInstance[]>(instances);

  const { currentInstance } = useInstanceStatus(selectedInstance, setLocalInstances);

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
          <InstanceCard
            key={instance.id}
            instance={instance}
            onDelete={onDelete}
            onGenerateQR={handleGenerateQR}
          />
        ))}
      </div>

      <QRCodeDialog
        isOpen={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        qrCodeBase64={qrCodeBase64}
        isLoading={isLoading}
        instanceName={selectedInstance?.name || ""}
        onRefresh={() => selectedInstance && refreshQRCode(selectedInstance)}
        instanceStatus={currentInstance?.status}
      />
    </>
  );
};