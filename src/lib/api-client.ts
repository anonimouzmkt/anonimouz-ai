import { supabase } from "@/integrations/supabase/client";

class ApiClient {
  private apiKey: string | null = null;

  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('id', user.id)
        .single();

      if (profile) {
        this.apiKey = profile.api_key;
        console.log('API client initialized with key');
      }
    } catch (error) {
      console.error('Error initializing API client:', error);
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey || '',
    };
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
      const response = await supabase.functions.invoke('create-dispatch', {
        body: data,
        headers: this.getHeaders(),
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error creating dispatch:', error);
      throw error;
    }
  }

  // Add more methods as needed for other endpoints
}

export const apiClient = new ApiClient();