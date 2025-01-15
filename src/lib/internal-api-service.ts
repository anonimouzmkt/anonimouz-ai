import { supabase } from "@/integrations/supabase/client";

class InternalApiService {
  private static instance: InternalApiService;
  private baseUrl: string = "https://anonimouz-ai.lovable.app/api";

  private constructor() {
    console.log('Internal API Service initialized');
  }

  public static getInstance(): InternalApiService {
    if (!InternalApiService.instance) {
      InternalApiService.instance = new InternalApiService();
    }
    return InternalApiService.instance;
  }

  // WhatsApp Instance Management
  public async createWhatsAppInstance(name: string) {
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

  // Dispatch Management
  public async createDispatch(data: {
    message: string;
    instanceId: string;
    isAiDispatch: boolean;
    aiContext?: string;
    contacts: Array<{ name: string; phone: string; }>;
  }) {
    console.log('Creating dispatch:', data);
    
    try {
      const response = await supabase.functions.invoke('create-dispatch', {
        body: data
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating dispatch:', error);
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
      const response = await supabase.functions.invoke('handle-dispatch', {
        body: data
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
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
      const response = await supabase.functions.invoke('update-dispatch-status', {
        body: data
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      throw error;
    }
  }

  public async updateAIDispatchStatus(data: {
    dispatchId: string;
    phone: string;
    status: string;
    error?: string;
  }) {
    console.log('Updating AI dispatch status:', data);
    
    try {
      const response = await supabase.functions.invoke('update-ai-dispatch-status', {
        body: data
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error updating AI dispatch status:', error);
      throw error;
    }
  }
}

export const internalApiService = InternalApiService.getInstance();