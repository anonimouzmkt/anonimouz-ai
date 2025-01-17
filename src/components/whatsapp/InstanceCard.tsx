import { Trash, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppInstance } from "@/types/whatsapp";

interface InstanceCardProps {
  instance: WhatsAppInstance;
  onDelete: (instanceId: string) => void;
  onGenerateQR: (instance: WhatsAppInstance) => void;
}

export const InstanceCard = ({ instance, onDelete, onGenerateQR }: InstanceCardProps) => {
  return (
    <Card className="bg-[#222222] p-4 space-y-2">
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
            onClick={() => onGenerateQR(instance)}
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
  );
};