import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CSVUploader } from "@/components/CSVUploader";
import { ContactSection } from "@/components/ContactSection";
import { MessageComposer } from "@/components/MessageComposer";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

declare global {
  interface Window {
    __CONTACTS_LOADED__: boolean;
  }
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentDispatchId, setCurrentDispatchId] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    window.__CONTACTS_LOADED__ = contacts.length > 0;
  }, [contacts]);

  const { data: currentDispatch } = useQuery({
    queryKey: ["dispatch", currentDispatchId],
    queryFn: async () => {
      if (!currentDispatchId) return null;

      const { data: results, error } = await supabase
        .from("dispatch_contact_results")
        .select("*")
        .eq("dispatch_id", currentDispatchId);

      if (error) throw error;
      return results;
    },
    enabled: !!currentDispatchId,
  });

  useEffect(() => {
    if (currentDispatch) {
      console.log('Updating contacts with dispatch results:', currentDispatch);
      
      setContacts(prevContacts => 
        prevContacts.map(contact => {
          const result = currentDispatch.find(r => r.contact_phone === contact.phone);
          if (result) {
            console.log(`Updating status for contact ${contact.phone} to ${result.status}`);
            return {
              ...contact,
              status: result.status as "pending" | "success" | "error",
              error: result.error_message
            };
          }
          return contact;
        })
      );
    }
  }, [currentDispatch]);

  const handleContactsLoaded = (loadedContacts: Contact[]) => {
    setContacts(loadedContacts.map(contact => ({
      ...contact,
      status: "pending"
    })));
  };

  const handleSendMessage = async (message: string, instanceId: string, isAiDispatch: boolean, aiContext?: string) => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log('Creating dispatch with contacts:', contacts);

      // Create dispatch record
      const { data: dispatch, error: dispatchError } = await supabase
        .from("dispatch_results")
        .insert({
          user_id: user.id,
          instance_id: instanceId,
          total_contacts: contacts.length,
          is_ai_dispatch: isAiDispatch,
          initial_message: message,
          ai_context: aiContext
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      console.log('Created dispatch:', dispatch);

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

      setCurrentDispatchId(dispatch.id);
      
      // Return the dispatch ID for webhook use
      return dispatch.id;
    } catch (error) {
      console.error("Error starting dispatch:", error);
      toast({
        title: "Erro ao iniciar disparo",
        description: "Ocorreu um erro ao iniciar o disparo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Upload Contacts</h2>
            <CSVUploader onContactsLoaded={handleContactsLoaded} />
          </div>

          {contacts.length > 0 && (
            <ContactSection 
              contacts={contacts} 
              dispatchId={currentDispatchId}
            />
          )}
        </div>

        {/* Right Column */}
        <div>
          <MessageComposer 
            onSend={handleSendMessage} 
            disabled={!contacts.length}
            contacts={contacts}
          />
        </div>
      </div>
    </main>
  );
};

export default Index;