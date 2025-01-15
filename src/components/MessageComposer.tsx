import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Add query to fetch user profile to get unique_id
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
          // Show toast notification when an instance connects
          if (payload.new.status === 'connected') {
            toast({
              title: "WhatsApp Conectado",
              description: `A instância ${payload.new.name} foi conectada com sucesso!`,
            });
          }
          // Refresh the instances list
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  const handleSend = () => {
    if (message.trim() && selectedInstance && profile?.unique_id) {
      // Add unique_id to the request headers when sending
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
      <div className="bg-[#222222] p-6 rounded-lg space-y-4">
        <div>
          <h2 className="text-white mb-1">
            Selecione a instância do WhatsApp para envio
          </h2>
          <Select
            value={selectedInstance}
            onValueChange={setSelectedInstance}
          >
            <SelectTrigger className="w-full bg-[#333333] border-[#0099ff] text-white">
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
            <p className="text-[#0099ff] text-sm mt-2">
              Você precisa conectar uma instância do WhatsApp primeiro
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#222222] p-6 rounded-lg space-y-4">
        <div>
          <h2 className="text-white mb-1">
            Descreva pro <span className="font-bold">Agent</span> qual o contexto
            do disparo
          </h2>
          <p className="text-gray-400">
            ou caso <span className="font-bold">esteja no prompt</span> avise
          </p>
          <p className="text-[#0099ff] text-sm mt-2">
            Exemplo: Seu objetivo está dentro do seu prompt principal na área
            disparo
          </p>
        </div>
        <Textarea
          placeholder="Escreva o contexto do disparo para o seu agente"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="min-h-[100px] bg-[#333333] border-[#0099ff] text-white"
        />
      </div>

      <div className="bg-[#222222] p-6 rounded-lg space-y-4">
        <div>
          <h2 className="text-white mb-1">
            Digite a mensagem inicial do <span className="font-bold">Agent</span>
          </h2>
          <p className="text-[#0099ff] text-sm">
            Exemplo: "Olá [[nome]], tudo bem?"
          </p>
        </div>
        <Textarea
          placeholder="Digite sua mensagem de disparo"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] bg-[#333333] border-[#0099ff] text-white"
        />
      </div>

      <Button
        className="w-full bg-[#0099ff] hover:bg-[#0088ee] text-white h-12"
        onClick={handleSend}
        disabled={
          disabled || !message.trim() || !selectedInstance || !instances?.length
        }
      >
        <Send className="w-5 h-5 mr-2" />
        Disparar mensagens
      </Button>
    </div>
  );
}