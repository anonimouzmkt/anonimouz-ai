import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContacts: Set<string>;
  onToggleContact: (phone: string) => void;
  onSelectAll: () => void;
}

export function ContactList({ contacts, selectedContacts, onToggleContact, onSelectAll }: ContactListProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <button
          onClick={onSelectAll}
          className="text-primary hover:text-primary/80 text-sm"
        >
          Select All
        </button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4">
          {contacts.map((contact) => (
            <div
              key={contact.phone}
              className="flex items-center space-x-4 py-2 hover:bg-muted/50 rounded-lg px-2 cursor-pointer"
              onClick={() => onToggleContact(contact.phone)}
            >
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                ${selectedContacts.has(contact.phone) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
              >
                {selectedContacts.has(contact.phone) && <Check className="w-3 h-3 text-white" />}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>

              {contact.status && (
                <div className={`text-sm ${
                  contact.status === "success" ? "text-green-500" :
                  contact.status === "error" ? "text-red-500" :
                  "text-yellow-500"
                }`}>
                  {contact.status}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}