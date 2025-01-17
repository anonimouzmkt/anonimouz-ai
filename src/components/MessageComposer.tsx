import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InstanceSelector } from "./message-composer/InstanceSelector";
import { AIContextInput } from "./message-composer/AIContextInput";
import { MessageInput } from "./message-composer/MessageInput";
import { ValidationErrors } from "./message-composer/ValidationErrors";
import { SendButton } from "./message-composer/SendButton";

interface MessageComposerProps {
  onSend: (message: string, instanceId: string, isAiDispatch: boolean, aiContext?: string) => Promise<string | undefined>;
  disabled?: boolean;
  contacts?: { name: string; phone: string }[];
}

export function MessageComposer({ onSend, disabled, contacts = [] }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<string>("");
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

    if (!context.trim()) {
      errors.push("Digite o contexto do disparo");
    }

    if (!profile?.webhook_url) {
      errors.push("Configure o webhook de IA nas configurações");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSend = async () => {
    if (validateFields() && profile?.unique_id) {
      try {
        const dispatchId = await onSend(message, selectedInstance, true, context);
        
        if (dispatchId && profile.webhook_url) {
          console.log('Sending dispatch data to webhook:', profile.webhook_url);
          
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
          webhookUrl={profile?.webhook_url}
        />
      </div>

      <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
        <AIContextInput
          context={context}
          onContextChange={setContext}
        />
      </div>

      <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
        <MessageInput
          message={message}
          onMessageChange={setMessage}
          isAI={true}
        />
      </div>

      <ValidationErrors errors={validationErrors} />

      <SendButton
        onClick={handleSend}
        disabled={
          disabled || !message.trim() || !selectedInstance ||
          !context.trim()
        }
      />
    </div>
  );
}