import { useState } from "react";
import { CSVUploader } from "@/components/CSVUploader";
import { ContactList } from "@/components/ContactList";
import { MessageComposer } from "@/components/MessageComposer";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
        <main className="flex-1 p-6 bg-[#1a1a1a]">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between bg-[#222222] rounded-lg p-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Disparador A.I</h1>
                <p className="text-gray-400">
                  Dispare mensagens com I.A{" "}
                  <span className="text-[#0099ff]">Imobiliária Gabriel</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#22c55e]">Ligado</span>
                  <Switch defaultChecked />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {contacts.length === 0 ? (
              <CSVUploader onContactsLoaded={handleContactsLoaded} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-[#222222] p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <p className="text-white">
                        Selecione seus contatos para{" "}
                        <span className="font-bold">disparo</span> a partir das{" "}
                        <span className="text-[#22c55e]">TAGS</span>
                      </p>
                      <p className="text-white mt-2">
                        <span className="font-bold">{selectedContacts.size}</span>{" "}
                        contato(s) selecionado(s)
                      </p>
                    </div>
                    <ContactList
                      contacts={contacts}
                      selectedContacts={selectedContacts}
                      onToggleContact={toggleContact}
                      onSelectAll={handleSelectAll}
                    />
                  </div>
                </div>
                <MessageComposer
                  onSend={sendMessages}
                  disabled={selectedContacts.size === 0}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;