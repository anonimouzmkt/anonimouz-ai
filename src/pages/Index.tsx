import { useState, useEffect } from "react";
import { CSVUploader } from "@/components/CSVUploader";
import { ContactList } from "@/components/ContactList";
import { MessageComposer } from "@/components/MessageComposer";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Add warning before user leaves page with unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleLocationChange = () => {
      if (hasUnsavedChanges) {
        setShowExitWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [hasUnsavedChanges]);

  const handleContactsLoaded = (newContacts: Contact[]) => {
    setContacts(newContacts);
    setSelectedContacts(new Set());
    setHasUnsavedChanges(true);
  };

  const toggleContact = (phone: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedContacts(newSelected);
    setHasUnsavedChanges(true);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      const allPhones = contacts.map(c => c.phone);
      setSelectedContacts(new Set(allPhones));
    }
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(false);
  };

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-card rounded-lg p-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Disparador A.I</h1>
            <p className="text-muted-foreground">
              Dispare mensagens com I.A{" "}
              <span className="text-primary">Imobiliária Gabriel</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#22c55e]">Ligado</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {contacts.length === 0 ? (
          <CSVUploader onContactsLoaded={handleContactsLoaded} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <p className="text-card-foreground">
                    Selecione seus contatos para{" "}
                    <span className="font-bold">disparo</span> a partir das{" "}
                    <span className="text-[#22c55e]">TAGS</span>
                  </p>
                  <p className="text-card-foreground mt-2">
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

      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da página?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Se continuar, perderá todos os dados inseridos e terá que preenchê-los novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitWarning(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setHasUnsavedChanges(false);
              setShowExitWarning(false);
              // Navigate away
              window.history.back();
            }}>
              Sair mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Index;