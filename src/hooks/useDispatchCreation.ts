import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";

interface Contact {
  name: string;
  phone: string;
}

export function useDispatchCreation() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateFields = (
    selectedInstance: string,
    message: string,
    useAI: boolean,
    context: string
  ) => {
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

  const createDispatch = async (
    profile: any,
    selectedInstance: string,
    message: string,
    useAI: boolean,
    context: string,
    contacts: Contact[]
  ) => {
    if (!profile?.unique_id) {
      toast({
        title: "Erro",
        description: "Unique ID não encontrado. Por favor, recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create dispatch record
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

      return dispatch.id;
    } catch (error) {
      console.error('Error sending dispatch:', error);
      toast({
        title: "Erro no disparo",
        description: "Ocorreu um erro ao enviar os contatos",
        variant: "destructive"
      });
    }
  };

  return {
    validationErrors,
    validateFields,
    createDispatch
  };
}