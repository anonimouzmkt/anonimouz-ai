import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";

export const useCreateInstance = (refetchInstances: () => void) => {
  const { toast } = useToast();
  const { selectedUserId } = useSelectedUser();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      return user;
    },
  });

  const createInstance = async (instanceName: string) => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da instância é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    try {
      const userId = selectedUserId || currentUser?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      console.log('Calling Edge Function to create instance:', instanceName);
      const { data: apiResponse, error: apiError } = await supabase.functions.invoke(
        'create-whatsapp-instance',
        {
          body: { name: instanceName }
        }
      );

      if (apiError) {
        console.error('Edge Function error:', apiError);
        throw new Error(`Erro na função: ${apiError.message}`);
      }

      console.log('API Response:', apiResponse);

      if (!apiResponse || apiResponse.error) {
        throw new Error(apiResponse?.error || 'Falha ao criar instância na API do WhatsApp');
      }

      const { error: dbError } = await supabase.from("whatsapp_instances").insert({
        name: instanceName,
        status: "connecting",
        user_id: userId,
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Erro no banco de dados: ${dbError.message}`);
      }

      toast({
        title: "Sucesso",
        description: "Instância do WhatsApp criada com sucesso",
      });

      refetchInstances();
      return true;
    } catch (error) {
      console.error("Error creating instance:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar instância do WhatsApp",
        variant: "destructive",
      });
      return false;
    }
  };

  return { createInstance };
};