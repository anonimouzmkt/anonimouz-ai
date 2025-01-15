import { supabase } from "@/integrations/supabase/client";

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

  async createWhatsAppInstance(name: string) {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'create-whatsapp-instance',
        {
          body: { name }
        }
      );

      if (error) {
        throw error;
      }

      return response;
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      throw error;
    }
  }

  async generateQRCode(instanceName: string) {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        'generate-whatsapp-qr',
        {
          body: { instanceName }
        }
      );

      if (error) {
        throw error;
      }

      return response;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();