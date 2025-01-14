import { useState } from "react";
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

  const { data: instances } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("status", "connected");

      if (error) throw error;
      return data as WhatsAppInstance[];
    },
  });

  const handleSend = () => {
    if (message.trim() && selectedInstance) {
      onSend(message);
      setMessage("");
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
              <SelectValue placeholder="Selecione uma instância" />
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