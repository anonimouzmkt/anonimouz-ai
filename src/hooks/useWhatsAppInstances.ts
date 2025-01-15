import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppInstance } from "@/types/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { useSelectedUser } from "@/components/AppSidebar";

export const useWhatsAppInstances = () => {
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

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances", selectedUserId],
    queryFn: async () => {
      console.log("Fetching WhatsApp instances for user:", selectedUserId || currentUser?.id);
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("user_id", selectedUserId || currentUser?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching WhatsApp instances:", error);
        throw error;
      }
      return data as WhatsAppInstance[];
    },
    enabled: !!currentUser,
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

      refetch();
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

  const deleteInstance = async (instanceId: string) => {
    try {
      console.log('Starting deletion process for instance:', instanceId);

      // First, get all dispatch_results for this instance
      const { data: dispatchResults, error: dispatchQueryError } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('instance_id', instanceId);

      if (dispatchQueryError) {
        console.error('Error querying dispatch results:', dispatchQueryError);
        throw dispatchQueryError;
      }

      // Get array of dispatch result IDs
      const dispatchIds = dispatchResults?.map(dr => dr.id) || [];
      console.log('Found dispatch results:', dispatchIds);

      if (dispatchIds.length > 0) {
        // Delete related contact results first
        const { error: contactResultsError } = await supabase
          .from('dispatch_contact_results')
          .delete()
          .in('dispatch_id', dispatchIds);

        if (contactResultsError) {
          console.error('Error deleting contact results:', contactResultsError);
          throw contactResultsError;
        }
        console.log('Successfully deleted contact results');

        // Then delete dispatch results
        const { error: dispatchDeleteError } = await supabase
          .from('dispatch_results')
          .delete()
          .eq('instance_id', instanceId);

        if (dispatchDeleteError) {
          console.error('Error deleting dispatch results:', dispatchDeleteError);
          throw dispatchDeleteError;
        }
        console.log('Successfully deleted dispatch results');
      }

      // Finally delete the WhatsApp instance
      const { error: instanceDeleteError } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', instanceId);

      if (instanceDeleteError) {
        console.error('Error deleting WhatsApp instance:', instanceDeleteError);
        throw instanceDeleteError;
      }

      console.log('Successfully deleted WhatsApp instance');

      toast({
        title: "Sucesso",
        description: "Instância do WhatsApp removida com sucesso",
      });

      refetch();
      return true;
    } catch (error) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover instância do WhatsApp",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    instances,
    createInstance,
    deleteInstance,
    refetch,
  };
};