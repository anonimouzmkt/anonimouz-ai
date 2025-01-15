import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface QRCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeBase64?: string;
  isLoading: boolean;
  instanceName: string;
}

export function QRCodeDialog({ isOpen, onOpenChange, qrCodeBase64, isLoading, instanceName }: QRCodeDialogProps) {
  const requestDetails = {
    method: "GET",
    url: `https://evo2.anonimouz.com/instance/connect/${instanceName}`,
    headers: {
      apikey: "WHATSAPP_API_KEY" // Mostramos apenas o nome da variável, não o valor
    },
    sendBody: false
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222222] text-white border-[#333333]">
        <DialogHeader>
          <DialogTitle>QR Code Generation</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="w-full bg-[#333333] p-4 rounded-md overflow-x-auto">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(requestDetails, null, 2)}
            </pre>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#0099ff]" />
              <p>Generating QR Code...</p>
            </div>
          ) : qrCodeBase64 ? (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
              />
              <p className="text-sm text-gray-400">Scan this QR code with WhatsApp to connect</p>
            </div>
          ) : (
            <p className="text-red-400">Failed to generate QR code</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}