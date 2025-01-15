import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "./api-config";

class ApiClient {
  private apiKey: string | null = null;
  private accessToken: string | null = null;

  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('id', user.id)
        .single();

      if (profile?.api_key) {
        this.apiKey = profile.api_key;
        console.log('API client initialized with api_key');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        this.accessToken = session.access_token;
        console.log('API client initialized with access_token');
      }
    } catch (error) {
      console.error('Error initializing API client:', error);
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Prefer API Key for external requests if available
    if (this.apiKey) {
      headers['apikey'] = this.apiKey;
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async createDispatch(data: {
    message: string;
    instanceId: string;
    isAiDispatch: boolean;
    aiContext?: string;
    contacts: { name: string; phone: string; }[];
  }) {
    try {
      console.log('Creating dispatch with data:', data);
      
      const response = await fetch(`${API_BASE_URL}/create-dispatch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating dispatch:', error);
      throw error;
    }
  }

  async createWhatsAppInstance(name: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/create-whatsapp-instance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      throw error;
    }
  }

  async generateQRCode(instanceName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-whatsapp-qr`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ instanceName })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
