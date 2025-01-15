import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppHeaderProps {
  onNewInstance: () => void;
}

export const WhatsAppHeader = ({ onNewInstance }: WhatsAppHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie suas instâncias do WhatsApp
        </p>
      </div>
      <Button
        onClick={onNewInstance}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Instância
      </Button>
    </div>
  );
};