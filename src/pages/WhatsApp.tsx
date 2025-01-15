import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppHeader } from "@/components/whatsapp/WhatsAppHeader";
import { InstanceList } from "@/components/whatsapp/InstanceList";
import { CreateInstanceDialog } from "@/components/whatsapp/CreateInstanceDialog";
import { useSelectedUser } from "@/components/AppSidebar";
import type { WhatsAppInstance } from "@/types/whatsapp";

const WhatsApp = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [instanceName, setInstanceName] = useState("");
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

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da instância é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
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

      setShowDialog(false);
      setInstanceName("");
      refetch();
    } catch (error) {
      console.error("Error creating instance:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar instância do WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_instances")
        .delete()
        .eq("id", instanceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Instância do WhatsApp removida com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
    } catch (error) {
      console.error("Error deleting instance:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover instância do WhatsApp",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <WhatsAppHeader onNewInstance={() => setShowDialog(true)} />
        <InstanceList 
          instances={instances || []} 
          onDelete={handleDeleteInstance}
        />
      </div>

      <CreateInstanceDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        instanceName={instanceName}
        onInstanceNameChange={setInstanceName}
        onSubmit={handleCreateInstance}
        isCreating={isCreating}
      />
    </main>
  );
};

export default WhatsApp;