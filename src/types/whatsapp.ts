export interface WhatsAppInstance {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "connecting";
  qr_code: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}