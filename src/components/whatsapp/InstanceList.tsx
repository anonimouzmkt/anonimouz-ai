import { Trash, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppInstance } from "@/types/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstanceListProps {
  instances: WhatsAppInstance[];
  onDelete: (instanceId: string) => void;
}

export const InstanceList = ({ instances, onDelete }: InstanceListProps) => {
  const { toast } = useToast();

  const handleGenerateQR = async (instance: WhatsAppInstance) => {
    try {
      console.log('Generating QR code for instance:', instance.name);
      
      const { data: response, error } = await supabase.functions.invoke(
        'generate-whatsapp-qr',
        {
          body: { instanceName: instance.name }
        }
      );

      if (error) {
        console.error('Error generating QR code:', error);
        throw error;
      }

      console.log('QR code response:', response);

      toast({
        title: "QR Code Generated",
        description: "Check your WhatsApp to scan the QR code",
      });

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {instances?.map((instance) => (
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
  );
};