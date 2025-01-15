import { supabase } from "@/integrations/supabase/client";

class ApiService {
  private static instance: ApiService;
  private accessToken: string | null = null;
  private baseUrl: string = "https://anonimouz-ai.lovable.app/api";

  private constructor() {
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

  private async getAuthHeaders() {
    await this.refreshTokenIfNeeded();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', user.id)
      .single();

    if (!profile?.unique_id) throw new Error('No unique_id found for user');

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'x-unique-id': profile.unique_id
    };
  }

  public async createWhatsAppInstance(name: string) {
    console.log('Creating WhatsApp instance:', name);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/instance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error(`Error creating WhatsApp instance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      throw error;
    }
  }

  public async generateQRCode(instanceName: string) {
    console.log('Generating QR code for instance:', instanceName);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/qr`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ instanceName })
      });

      if (!response.ok) {
        throw new Error(`Error generating QR code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  public async handleDispatch(data: {
    dispatchId: string;
    uniqueId: string;
    message: string;
    context?: string;
    contacts: Array<{ name: string; phone: string; }>;
  }) {
    console.log('Handling dispatch:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/dispatch`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error handling dispatch: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error handling dispatch:', error);
      throw error;
    }
  }

  public async updateDispatchStatus(data: {
    dispatchId: string;
    phone: string;
    status: string;
    error?: string;
  }) {
    console.log('Updating dispatch status:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error updating dispatch status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();