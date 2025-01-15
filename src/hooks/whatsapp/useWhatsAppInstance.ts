import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

export const useWhatsAppInstance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateQRCode = async (instanceName: string) => {
    setIsLoading(true);
    try {
      console.log('Generating QR code for instance:', instanceName);
      const response = await apiService.generateQRCode(instanceName);
      
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
      
      return response;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o QR code",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateQRCode,
    isLoading
  };
};