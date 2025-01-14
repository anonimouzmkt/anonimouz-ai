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
}

export function ContactList({ contacts, selectedContacts, onToggleContact, onSelectAll }: ContactListProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        <select className="flex-1 bg-[#333333] text-white rounded-md border border-[#444444] p-2">
          <option>Escolha uma tag</option>
        </select>
        <Button
          onClick={onSelectAll}
          className="bg-[#0099ff] hover:bg-[#0088ee] text-white"
        >
          Select All
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border border-[#444444]">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="w-8"></th>
                <th className="font-normal pb-2">Nome</th>
                <th className="font-normal pb-2">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.phone}
                  className="hover:bg-[#333333] cursor-pointer"
                  onClick={() => onToggleContact(contact.phone)}
                >
                  <td className="py-2">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                      ${selectedContacts.has(contact.phone) ? 'bg-[#0099ff] border-[#0099ff]' : 'border-gray-600'}`}
                    >
                      {selectedContacts.has(contact.phone) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </td>
                  <td className="py-2 text-gray-300">{contact.name}</td>
                  <td className="py-2 text-gray-300">{contact.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}