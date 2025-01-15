import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeBase64?: string;
  isLoading: boolean;
  instanceName: string;
  onRefresh?: () => void;
  instanceStatus?: string;
}

export function QRCodeDialog({ 
  isOpen, 
  onOpenChange, 
  qrCodeBase64, 
  isLoading, 
  instanceName,
  onRefresh,
  instanceStatus
}: QRCodeDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Effect to handle connection success
  useEffect(() => {
    if (instanceStatus === 'connected' && isOpen) {
      setShowSuccess(true);
      // Show success animation for 2 seconds before closing
      const timer = setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [instanceStatus, isOpen, onOpenChange]);

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
          {showSuccess ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-scale-in" />
              <p className="text-green-500 font-medium">WhatsApp Conectado!</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Gerando QR Code...</p>
            </div>
          ) : qrCodeBase64 ? (
            <div className={cn(
              "flex flex-col items-center gap-4",
              showSuccess && "animate-fade-out"
            )}>
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