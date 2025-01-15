import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  name: string;
  phone: string;
}

export function useDispatchCreation() {
  const { toast } = useToast();

  const createDispatch = async (
    profile: Profile,
    selectedInstance: string,
    message: string,
    useAI: boolean,
    context: string,
    contacts: Contact[]
  ) => {
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

      if (useAI && dispatch.id && profile.webhook_url) {
        console.log('Sending dispatch data to webhook:', profile.webhook_url);
        
        const webhookPayload = {
          dispatchId: dispatch.id,
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

      return dispatch.id;
    } catch (error) {
      console.error('Error sending dispatch:', error);
      toast({
        title: "Erro no disparo",
        description: "Ocorreu um erro ao enviar os contatos para o webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { createDispatch };
}