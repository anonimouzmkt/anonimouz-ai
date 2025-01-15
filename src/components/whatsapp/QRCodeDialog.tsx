import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface QRCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeBase64?: string;
  isLoading: boolean;
  instanceName: string;
  onRefresh?: () => void;
}

export function QRCodeDialog({ 
  isOpen, 
  onOpenChange, 
  qrCodeBase64, 
  isLoading, 
  instanceName,
  onRefresh 
}: QRCodeDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        if (onRefresh) {
          console.log('Refreshing QR code for instance:', instanceName);
          onRefresh();
        }
      }, 12000); // 12 segundos

      return () => clearInterval(interval);
    }
  }, [isOpen, onRefresh, instanceName]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>QR Code para {instanceName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Gerando QR Code...</p>
            </div>
          ) : qrCodeBase64 ? (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
              />
              <p className="text-sm text-muted-foreground">Escaneie este QR code com WhatsApp para conectar</p>
            </div>
          ) : (
            <p className="text-destructive">Falha ao gerar QR code</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}