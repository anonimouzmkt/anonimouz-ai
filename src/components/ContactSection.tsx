import { ContactList } from "@/components/ContactList";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

interface ContactSectionProps {
  contacts: Contact[];
  selectedContacts: Set<string>;
  onToggleContact: (phone: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ContactSection({ 
  contacts, 
  selectedContacts, 
  onToggleContact, 
  onSelectAll,
  onDeselectAll 
}: ContactSectionProps) {
  return (
    <div className="bg-card p-6 rounded-lg">
      <div className="space-y-4">
        <div>
          <p className="text-card-foreground">
            Selecione seus contatos para{" "}
            <span className="font-bold">disparo</span>
          </p>
          <p className="text-card-foreground mt-2">
            <span className="font-bold">{selectedContacts.size}</span>{" "}
            contato(s) selecionado(s) de {contacts.length} total
          </p>
        </div>
        <ContactList
          contacts={contacts}
          selectedContacts={selectedContacts}
          onToggleContact={onToggleContact}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
      </div>
    </div>
  );
}