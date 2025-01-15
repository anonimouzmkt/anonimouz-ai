import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DeleteDataButton() {
  const { toast } = useToast();

  const handleDeleteData = async () => {
    try {
      console.log("Deleting dispatch data...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Get all dispatch results for the current user
      const { data: dispatchResults, error: fetchError } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      if (dispatchResults && dispatchResults.length > 0) {
        console.log("Found dispatch results to delete:", dispatchResults.length);
        
        // First delete all related contact results
        const { error: contactError } = await supabase
          .from('dispatch_contact_results')
          .delete()
          .in('dispatch_id', dispatchResults.map(d => d.id));

        if (contactError) throw contactError;

        // Then delete the dispatch results
        const { error: dispatchError } = await supabase
          .from('dispatch_results')
          .delete()
          .eq('user_id', user.id);

        if (dispatchError) throw dispatchError;
      }

      toast({
        title: "Dados excluídos com sucesso",
        description: "Todos os resultados foram removidos.",
      });

      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('refetchDispatchData'));
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Erro ao excluir dados",
        description: "Não foi possível excluir os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDeleteData}
      className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
    >
      <Trash2 className="h-4 w-4" />
      Excluir Dados
    </Button>
  );
}