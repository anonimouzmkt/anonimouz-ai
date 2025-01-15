import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

export const useCreateInstance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createInstance = async (name: string) => {
    setIsLoading(true);
    try {
      console.log('Creating WhatsApp instance:', name);
      await apiService.createWhatsAppInstance(name);
      
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-instances'] });
      
      toast({
        title: "Instância criada",
        description: "A instância do WhatsApp foi criada com sucesso"
      });
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a instância do WhatsApp",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInstance,
    isLoading
  };
};