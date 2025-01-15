import { CSVUploader } from "@/components/CSVUploader";
import { ContactList } from "@/components/ContactList";
import { MessageComposer } from "@/components/MessageComposer";
import { useState } from "react";

interface Contact {
  name: string;
  phone: string;
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const handleContactsLoaded = (loadedContacts: Contact[]) => {
    setContacts(loadedContacts);
    setSelectedContacts(new Set()); // Reset selection when new contacts are loaded
  };

  const handleToggleContact = (phone: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phone)) {
        newSet.delete(phone);
      } else {
        newSet.add(phone);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedContacts(new Set(contacts.map(contact => contact.phone)));
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    console.log("To contacts:", contacts);
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
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Contact List</h2>
              <ContactList 
                contacts={contacts}
                selectedContacts={selectedContacts}
                onToggleContact={handleToggleContact}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          <MessageComposer onSend={handleSendMessage} />
        </div>
      </div>
    </main>
  );
};

export default Index;