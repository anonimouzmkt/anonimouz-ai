import { supabase } from "@/integrations/supabase/client";

class ApiService {
  private static instance: ApiService;
  private accessToken: string | null = null;

  private constructor() {
    // Initialize token from current session if available
    this.initializeToken();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async initializeToken() {
    const { data: { session } } = await supabase.auth.getSession();
    this.accessToken = session?.access_token || null;
    console.log('Token initialized:', this.accessToken ? 'Token present' : 'No token');
  }

  private async refreshTokenIfNeeded() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        this.accessToken = data.session?.access_token || null;
        console.log('Token refreshed:', this.accessToken ? 'New token obtained' : 'Failed to refresh');
      } else {
        this.accessToken = session.access_token;
        console.log('Using existing valid token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  public async createWhatsAppInstance(name: string) {
    await this.refreshTokenIfNeeded();
    
    console.log('Creating WhatsApp instance:', name);
    
    try {
      const response = await supabase.functions.invoke('create-whatsapp-instance', {
        body: { name }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      throw error;
    }
  }

  public async generateQRCode(instanceName: string) {
    await this.refreshTokenIfNeeded();
    
    console.log('Generating QR code for instance:', instanceName);
    
    try {
      const response = await supabase.functions.invoke('generate-whatsapp-qr', {
        body: { instanceName }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  public async handleDispatch(dispatchData: {
    dispatchId: string;
    uniqueId: string;
    message: string;
    context?: string;
    contacts: Array<{ name: string; phone: string; }>;
  }) {
    await this.refreshTokenIfNeeded();
    
    console.log('Handling dispatch with data:', dispatchData);
    
    try {
      const response = await supabase.functions.invoke('handle-dispatch', {
        body: dispatchData
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error in handleDispatch:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();