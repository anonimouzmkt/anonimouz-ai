import { WhatsAppService } from "./services/whatsapp-service";

class ApiService {
  private whatsappService: WhatsAppService;

  private constructor() {
    this.whatsappService = WhatsAppService.getInstance();
  }

  private static instance: ApiService;

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // WhatsApp methods
  public async createWhatsAppInstance(name: string) {
    return this.whatsappService.createInstance(name);
  }

  public async generateQRCode(instanceName: string) {
    return this.whatsappService.generateQRCode(instanceName);
  }

  public async handleDispatch(data: {
    dispatchId: string;
    uniqueId: string;
    message: string;
    context?: string;
    contacts: Array<{ name: string; phone: string; }>;
  }) {
    return this.whatsappService.handleDispatch(data);
  }

  public async updateDispatchStatus(data: {
    dispatchId: string;
    phone: string;
    status: string;
    error?: string;
  }) {
    return this.whatsappService.updateDispatchStatus(data);
  }

  public async updateAIDispatchStatus(data: {
    dispatchId: string;
    phone: string;
    status: string;
    error?: string;
  }) {
    return this.whatsappService.updateAIDispatchStatus(data);
  }

  public async handleWebhook(data: any) {
    return this.whatsappService.handleWebhook(data);
  }
}

export const apiService = ApiService.getInstance();