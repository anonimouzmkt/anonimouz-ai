import { useState, useEffect } from "react";
import { Plus, Trash, QrCode } from "lucide-react";
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
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [qrError, setQRError] = useState<string | null>(null);

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

      // Create the instance in our database
      const { error: dbError } = await supabase.from("whatsapp_instances").insert({
        name: instanceName,
        status: "connecting",
        user_id: user.id,
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

  const generateQRCode = async (instance: WhatsAppInstance) => {
    try {
      setQRError(null);
      const { data: apiResponse, error: apiError } = await supabase.functions.invoke(
        'generate-whatsapp-qr',
        {
          body: { instanceName: instance.name }
        }
      );

      if (apiError) {
        console.error('QR Code generation error:', apiError);
        setQRError(`Erro ao gerar QR Code: ${apiError.message}`);
        return;
      }

      if (!apiResponse || apiResponse.error) {
        setQRError(apiResponse?.error || 'Falha ao gerar QR Code');
        return;
      }

      if (apiResponse.qrcode?.base64?.value) {
        setQRCode(apiResponse.qrcode.base64.value);
      } else {
        setQRError('QR Code não disponível');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQRError('Erro ao gerar QR Code');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showQRDialog && selectedInstance) {
      // Initial QR code generation
      generateQRCode(selectedInstance);

      // Set up interval for refreshing QR code every 12 seconds
      interval = setInterval(() => {
        generateQRCode(selectedInstance);
      }, 12000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showQRDialog, selectedInstance]);

  const handleShowQRCode = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowQRDialog(true);
    setQRCode(null);
    setQRError(null);
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
                    onClick={() => handleShowQRCode(instance)}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
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

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {selectedInstance?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrError ? (
              <p className="text-red-500">{qrError}</p>
            ) : qrCode ? (
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            ) : (
              <p className="text-gray-400">Gerando QR Code...</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQRDialog(false);
                setSelectedInstance(null);
                setQRCode(null);
                setQRError(null);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default WhatsApp;
