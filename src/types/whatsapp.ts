export interface WhatsAppInstance {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "connecting";
  qr_code: string | null;
}