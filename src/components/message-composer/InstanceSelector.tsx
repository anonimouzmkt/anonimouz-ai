import { useQuery } from "@tanstack/react-query";
import { Bot, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WhatsAppInstance {
  id: string;
  name: string;
  status: string;
}

interface InstanceSelectorProps {
  selectedInstance: string;
  onInstanceSelect: (instanceId: string) => void;
  useAI: boolean;
  onAIToggle: (useAI: boolean) => void;
  webhookUrl?: string | null;
}

export function InstanceSelector({
  selectedInstance,
  onInstanceSelect,
  useAI,
  onAIToggle,
  webhookUrl,
}: InstanceSelectorProps) {
  const { data: instances, isLoading: isLoadingInstances } = useQuery({
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

  return (
    <div className="space-y-4">
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
                    onCheckedChange={onAIToggle}
                  />
                  <span className="text-sm text-muted-foreground">
                    Usar I.A
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ative para usar I.A nos disparos</p>
                {!webhookUrl && (
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
        onValueChange={onInstanceSelect}
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
  );
}