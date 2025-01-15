import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteInstance = (refetchInstances: () => void) => {
  const { toast } = useToast();

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

      refetchInstances();
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

  return { deleteInstance };
};