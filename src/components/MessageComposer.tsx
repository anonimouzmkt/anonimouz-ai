import React, { useState } from "react";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstanceSelector } from "./message-composer/InstanceSelector";
import { AIContextInput } from "./message-composer/AIContextInput";
import { MessageInput } from "./message-composer/MessageInput";

interface MessageComposerProps {
  onSend: (message: string, instanceId: string, isAiDispatch: boolean, aiContext?: string) => Promise<string | undefined>;
  disabled?: boolean;
  contacts?: { name: string; phone: string }[];
}

export function MessageComposer({ onSend, disabled, contacts = [] }: MessageComposerProps) {
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

  const handleSend = async () => {
    if (validateFields() && profile?.unique_id) {
      try {
        // Chama onSend e espera o ID do disparo
        const dispatchId = await onSend(message, selectedInstance, useAI, useAI ? context : undefined);
        
        if (useAI && dispatchId && profile.webhook_url) {
          console.log('Sending dispatch data to webhook:', profile.webhook_url);
          
          // Prepara o payload para o webhook
          const webhookPayload = {
            dispatchId,
            uniqueId: profile.unique_id,
            message,
            context,
            contacts: contacts.map(contact => ({
              name: contact.name,
              phone: contact.phone
            }))
          };

          // Envia para o webhook configurado
          const response = await fetch(profile.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload)
          });

          if (!response.ok) {
            throw new Error('Failed to send to webhook');
          }

          toast({
            title: "Disparo iniciado",
            description: "Os contatos foram enviados para processamento com I.A"
          });
        }

        setMessage("");
      } catch (error) {
        console.error('Error sending dispatch:', error);
        toast({
          title: "Erro no disparo",
          description: "Ocorreu um erro ao enviar os contatos para o webhook",
          variant: "destructive"
        });
      }
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
        <InstanceSelector
          selectedInstance={selectedInstance}
          onInstanceSelect={setSelectedInstance}
          useAI={useAI}
          onAIToggle={setUseAI}
          webhookUrl={profile?.webhook_url}
        />
      </div>

      {useAI && (
        <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
          <AIContextInput
            context={context}
            onContextChange={setContext}
          />
        </div>
      )}

      <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
        <MessageInput
          message={message}
          onMessageChange={setMessage}
          isAI={useAI}
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
          disabled || !message.trim() || !selectedInstance ||
          (useAI && !context.trim())
        }
      >
        <Send className="w-5 h-5 mr-2" />
        Disparar mensagens
      </Button>
    </div>
  );
}