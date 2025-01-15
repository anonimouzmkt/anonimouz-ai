import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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
  onDeselectAll: () => void;
}

export function ContactList({ 
  contacts, 
  selectedContacts, 
  onToggleContact, 
  onSelectAll,
  onDeselectAll 
}: ContactListProps) {
  const allSelected = contacts.length > 0 && selectedContacts.size === contacts.length;

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={onSelectAll}
          className="bg-[#0099ff] hover:bg-[#0088ee] text-white flex-1"
        >
          {allSelected ? "Unselect All" : "Select All"}
        </Button>
        <Button
          onClick={onDeselectAll}
          variant="outline"
          className="flex-1"
        >
          Remove Selected
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border border-[#444444]">
        <div className="p-4">
          <div className="min-w-full">
            <div className="border-b border-[#444444] pb-2 mb-2">
              <div className="grid grid-cols-[48px_1fr_1fr] gap-4">
                <div></div>
                <div className="text-gray-400 font-normal">Nome</div>
                <div className="text-gray-400 font-normal">Telefone</div>
              </div>
            </div>
            <div className="space-y-1">
              {contacts.map((contact) => (
                <div
                  key={contact.phone}
                  onClick={() => onToggleContact(contact.phone)}
                  className="grid grid-cols-[48px_1fr_1fr] gap-4 items-center py-2 px-2 hover:bg-[#333333] rounded cursor-pointer"
                >
                  <div className="flex items-center justify-center">
                    <div 
                      className={`w-5 h-5 rounded-full border flex items-center justify-center
                        ${selectedContacts.has(contact.phone) 
                          ? 'bg-[#0099ff] border-[#0099ff]' 
                          : 'border-gray-600'
                        }`}
                    >
                      {selectedContacts.has(contact.phone) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="text-gray-300">{contact.name}</div>
                  <div className="text-gray-300">{contact.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}