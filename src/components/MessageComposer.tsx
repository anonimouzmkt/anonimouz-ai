import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstanceSelector } from "./message-composer/InstanceSelector";
import { AIContextInput } from "./message-composer/AIContextInput";
import { MessageInput } from "./message-composer/MessageInput";
import { apiService } from "@/lib/api-service";
import { useSelectedUser } from "./sidebar/SidebarContext";

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
  const { selectedUserId } = useSelectedUser();

  const { data: profile } = useQuery({
    queryKey: ["profile", selectedUserId],
    queryFn: async () => {
      console.log("Fetching profile for user:", selectedUserId || "current user");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", selectedUserId || user.id)
        .single();

      console.log("Fetched profile:", profile);
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

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSend = async () => {
    if (validateFields() && profile?.unique_id) {
      try {
        // Create dispatch record first
        const { data: dispatch, error: dispatchError } = await supabase
          .from("dispatch_results")
          .insert({
            user_id: profile.id,
            instance_id: selectedInstance,
            total_contacts: contacts.length,
            is_ai_dispatch: useAI,
            initial_message: message,
            ai_context: useAI ? context : undefined
          })
          .select()
          .single();

        if (dispatchError) throw dispatchError;

        // Create contact results
        const { error: contactsError } = await supabase
          .from("dispatch_contact_results")
          .insert(
            contacts.map(contact => ({
              dispatch_id: dispatch.id,
              contact_name: contact.name,
              contact_phone: contact.phone,
              status: "pending"
            }))
          );

        if (contactsError) throw contactsError;
        
        if (useAI && dispatch.id) {
          console.log('Sending dispatch data through API service');
          
          await apiService.handleDispatch({
            dispatchId: dispatch.id,
            uniqueId: profile.unique_id,
            message,
            context,
            contacts: contacts.map(contact => ({
              name: contact.name,
              phone: contact.phone
            }))
          });

          toast({
            title: "Disparo iniciado",
            description: "Os contatos foram enviados para processamento com I.A"
          });
        }

        setMessage("");
        setContext("");
      } catch (error) {
        console.error('Error sending dispatch:', error);
        toast({
          title: "Erro no disparo",
          description: "Ocorreu um erro ao enviar os contatos",
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