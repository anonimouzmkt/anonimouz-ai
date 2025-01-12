import { useState } from "react";
import { CSVUploader } from "@/components/CSVUploader";
import { ContactList } from "@/components/ContactList";
import { MessageComposer } from "@/components/MessageComposer";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleContactsLoaded = (newContacts: Contact[]) => {
    setContacts(newContacts);
    setSelectedContacts(new Set());
  };

  const toggleContact = (phone: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.phone)));
    }
  };

  const sendMessages = async (message: string) => {
    if (selectedContacts.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one contact",
        variant: "destructive",
      });
      return;
    }

    setContacts(contacts.map(contact => ({
      ...contact,
      status: selectedContacts.has(contact.phone) ? "pending" : contact.status
    })));

    for (const contact of contacts) {
      if (selectedContacts.has(contact.phone)) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (Math.random() > 0.3) {
            setContacts(prev => prev.map(c => 
              c.phone === contact.phone ? { ...c, status: "success" } : c
            ));
          } else {
            throw new Error("Failed to send message");
          }
        } catch (error) {
          setContacts(prev => prev.map(c => 
            c.phone === contact.phone ? { ...c, status: "error", error: "Failed to send message" } : c
          ));
        }
      }
    }

    toast({
      title: "Complete",
      description: "All messages have been processed",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">WhatsApp Message Dispatcher</h1>
              <p className="text-muted-foreground">Upload your contacts and send messages in bulk</p>
            </div>

            {contacts.length === 0 ? (
              <CSVUploader onContactsLoaded={handleContactsLoaded} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ContactList
                  contacts={contacts}
                  selectedContacts={selectedContacts}
                  onToggleContact={toggleContact}
                  onSelectAll={handleSelectAll}
                />
                <div>
                  <MessageComposer
                    onSend={sendMessages}
                    disabled={selectedContacts.size === 0}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;