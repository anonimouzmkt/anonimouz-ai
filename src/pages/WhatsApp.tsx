import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WhatsAppInstance {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "connecting";
  qr_code: string | null;
}

const WhatsApp = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [instanceName, setInstanceName] = useState("");

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WhatsAppInstance[];
    },
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("whatsapp_instances").insert({
        name: instanceName,
        status: "disconnected",
        user_id: user.id,
      });

      if (error) throw error;

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
        description: "Falha ao criar instância do WhatsApp",
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
    <main className="flex-1 p-6 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-[#222222] rounded-lg p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">WhatsApp</h1>
            <p className="text-gray-400">
              Gerencie suas instâncias do WhatsApp
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-[#0099ff] hover:bg-[#0088ee]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances?.map((instance) => (
            <div
              key={instance.id}
              className="bg-[#222222] p-4 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {instance.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      instance.status === "connected"
                        ? "bg-green-500/20 text-green-500"
                        : instance.status === "connecting"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {instance.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteInstance(instance.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {instance.qr_code && (
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={instance.qr_code}
                    alt="QR Code"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Instância do WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instância</Label>
              <Input
                id="name"
                placeholder="Digite o nome da instância"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setInstanceName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateInstance}
              disabled={isCreating}
              className="bg-[#0099ff] hover:bg-[#0088ee]"
            >
              {isCreating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default WhatsApp;