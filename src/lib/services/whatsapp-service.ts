import { BaseService } from "./base-service";

interface Contact {
  name: string;
  phone: string;
}

interface DispatchData {
  dispatchId: string;
  uniqueId: string;
  message: string;
  context?: string;
  contacts: Contact[];
}

interface StatusUpdate {
  dispatchId: string;
  phone: string;
  status: string;
  error?: string;
}

export class WhatsAppService extends BaseService {
  private static instance: WhatsAppService;

  private constructor() {
    super();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async createInstance(name: string) {
    console.log('Creating WhatsApp instance:', name);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/instance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error creating WhatsApp instance: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Instance created successfully:', data);
      return data;
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
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error generating QR code: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('QR code generated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  public async handleDispatch(data: DispatchData) {
    console.log('Handling dispatch:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      console.log('Request headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/whatsapp/dispatch`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!response.ok) {
        console.error('Error response:', responseText);
        throw new Error(`Error handling dispatch: ${response.statusText}`);
      }

      try {
        const jsonData = JSON.parse(responseText);
        console.log('Dispatch handled successfully:', jsonData);
        return jsonData;
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Error handling dispatch:', error);
      throw error;
    }
  }

  public async updateDispatchStatus(data: StatusUpdate) {
    console.log('Updating dispatch status:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error updating dispatch status: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log('Status updated successfully:', jsonData);
      return jsonData;
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      throw error;
    }
  }

  public async updateAIDispatchStatus(data: StatusUpdate) {
    console.log('Updating AI dispatch status:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/ai-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error updating AI dispatch status: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log('AI status updated successfully:', jsonData);
      return jsonData;
    } catch (error) {
      console.error('Error updating AI dispatch status:', error);
      throw error;
    }
  }

  public async handleWebhook(data: any) {
    console.log('Handling webhook:', data);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/whatsapp/webhook`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error handling webhook: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log('Webhook handled successfully:', jsonData);
      return jsonData;
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }
}