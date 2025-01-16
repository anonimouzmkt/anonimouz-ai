import { useEffect } from "react";
import { ContactList } from "@/components/ContactList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

interface ContactSectionProps {
  contacts: Contact[];
  dispatchId?: string;
}

export function ContactSection({ contacts, dispatchId }: ContactSectionProps) {
  useEffect(() => {
    if (!dispatchId) return;

    console.log('Setting up real-time subscription for dispatch:', dispatchId);

    // Subscribe to real-time updates for contact results
    const channel = supabase
      .channel('contact-results')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_contact_results',
          filter: `dispatch_id=eq.${dispatchId}`,
        },
        (payload) => {
          console.log('Contact result updated:', payload);
          
          // The update will be handled by the parent component through React Query
          // This subscription is mainly for debugging and real-time status monitoring
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          toast.success('Connected to real-time updates');
        } else if (status === 'CLOSED') {
          toast.error('Lost connection to real-time updates');
        }
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [dispatchId]);

  return (
    <div className="bg-card p-6 rounded-lg">
      <div className="space-y-4">
        <div>
          <p className="text-card-foreground">
            Contatos carregados para{" "}
            <span className="font-bold">disparo</span>
          </p>
          <p className="text-card-foreground mt-2">
            <span className="font-bold">{contacts.length}</span>{" "}
            contato(s) total
          </p>
        </div>
        <ContactList contacts={contacts} />
      </div>
    </div>
  );
}