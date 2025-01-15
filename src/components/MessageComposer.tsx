import { useState, useEffect } from "react";
import { Send, Bot, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MessageComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

interface WhatsAppInstance {
  id: string;
  name: string;
  status: string;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [useAI, setUseAI] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    }
  });

  const { data: instances, isLoading: isLoadingInstances, refetch } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      console.log('Fetching WhatsApp instances for current user...');
      
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("status", "connected");

      if (error) {
        console.error('Error fetching instances:', error);
        throw error;
      }

      console.log('Fetched instances:', data);
      return data as WhatsAppInstance[];
    },
  });

  useEffect(() => {
    // Subscribe to real-time updates for whatsapp_instances table
    const channel = supabase
      .channel('instance-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_instances'
        },
        (payload) => {
          console.log('Instance updated:', payload);
          if (payload.new.status === 'connected') {
            toast({
              title: "WhatsApp Conectado",
              description: `A instância ${payload.new.name} foi conectada com sucesso!`,
            });
          }
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  const validateFields = () => {
    const errors: string[] = [];

    if (!selectedInstance) {
      errors.push("Selecione uma instância do WhatsApp");
    }

    if (!message.trim()) {
      errors.push("Digite uma mensagem inicial");
    }

    if (useAI && !context.trim()) {
      errors.push("Digite o contexto do disparo quando usar I.A");
    }

    if (useAI && !profile?.webhook_url) {
      errors.push("Configure o webhook de IA nas configurações");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSend = () => {
    if (validateFields() && profile?.unique_id) {
      const headers = {
        'x-unique-id': profile.unique_id
      };
      console.log('Sending request with unique_id in headers:', headers);
      onSend(message);
      setMessage("");
    } else if (!profile?.unique_id) {
      toast({
        title: "Erro",
        description: "Unique ID não encontrado. Por favor, recarregue a página.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-card-foreground mb-1">
            Selecione a instância do WhatsApp para envio
          </h2>
          <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${useAI ? 'text-primary' : 'text-muted-foreground'}`} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={useAI}
                      onCheckedChange={setUseAI}
                    />
                    <span className="text-sm text-muted-foreground">
                      Usar I.A
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ative para usar I.A nos disparos</p>
                  {!profile?.webhook_url && (
                    <p className="text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      Webhook não configurado
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Select
          value={selectedInstance}
          onValueChange={setSelectedInstance}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={
              isLoadingInstances 
                ? "Carregando instâncias..." 
                : instances?.length 
                  ? "Selecione uma instância" 
                  : "Nenhuma instância conectada"
            } />
          </SelectTrigger>
          <SelectContent>
            {instances?.map((instance) => (
              <SelectItem
                key={instance.id}
                value={instance.id}
                className="cursor-pointer"
              >
                {instance.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoadingInstances && !instances?.length && (
          <p className="text-primary text-sm mt-2">
            Você precisa conectar uma instância do WhatsApp primeiro
          </p>
        )}
      </div>

      {useAI && (
        <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
          <div>
            <h2 className="text-card-foreground mb-1">
              Descreva pro <span className="font-bold">Agent</span> qual o contexto
              do disparo
            </h2>
            <p className="text-muted-foreground">
              ou caso <span className="font-bold">esteja no prompt</span> avise
            </p>
            <p className="text-primary text-sm mt-2">
              Exemplo: Seu objetivo está dentro do seu prompt principal na área
              disparo
            </p>
          </div>
          <Textarea
            placeholder="Escreva o contexto do disparo para o seu agente"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      )}

      <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
        <div>
          <h2 className="text-card-foreground mb-1">
            Digite a mensagem inicial do <span className="font-bold">{useAI ? "Agent" : "disparo"}</span>
          </h2>
          <p className="text-primary text-sm">
            Exemplo: "Olá [[nome]], tudo bem?"
          </p>
        </div>
        <Textarea
          placeholder="Digite sua mensagem de disparo"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
        onClick={handleSend}
        disabled={
          disabled || !message.trim() || !selectedInstance || !instances?.length ||
          (useAI && !context.trim())
        }
      >
        <Send className="w-5 h-5 mr-2" />
        Disparar mensagens
      </Button>
    </div>
  );
}