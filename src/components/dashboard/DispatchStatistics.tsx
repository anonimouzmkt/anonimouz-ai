import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DispatchStatisticsProps {
  aiDispatches: number;
  normalDispatches: number;
  latestDispatchResults?: {
    contact_name: string;
    contact_phone: string;
    status: string;
  }[];
}

export function DispatchStatistics({ aiDispatches, normalDispatches, latestDispatchResults }: DispatchStatisticsProps) {
  const { toast } = useToast();

  const handleClearData = async () => {
    try {
      console.log("Clearing data...");
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
        console.log("Found dispatch results to clear:", dispatchResults.length);
        
        // Update contact results status for these dispatches
        const { error: updateError } = await supabase
          .from('dispatch_contact_results')
          .update({ 
            status: 'pending',
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .in('dispatch_id', dispatchResults.map(d => d.id));

        if (updateError) throw updateError;
      }

      toast({
        title: "Dados limpos com sucesso",
        description: "Os resultados dos disparos foram resetados.",
      });

      // Force refresh by calling the parent's refetch functions
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Erro ao limpar dados",
        description: "Não foi possível limpar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteData = async () => {
    try {
      console.log("Deleting data...");
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

      // Force refresh by calling the parent's refetch functions
      window.location.reload();
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
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Estatísticas de Disparos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Com I.A."
              value={aiDispatches}
              icon={Bot}
              iconClassName="text-primary"
            />
            <MetricCard
              title="Normais"
              value={normalDispatches}
              icon={Send}
              iconClassName="text-muted-foreground"
            />
          </div>

          {latestDispatchResults && latestDispatchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Últimos Disparos</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {latestDispatchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                  >
                    <div>
                      <span className="font-medium">{result.contact_name}</span>
                      <span className="text-muted-foreground ml-2">{result.contact_phone}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : result.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Dados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteData}
              className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Dados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}