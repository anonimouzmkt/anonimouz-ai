interface Contact {
  name: string;
  phone: string;
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
        <button
          onClick={onDeselectAll}
          className="flex-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md"
        >
          Clear Selection
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {contacts.map((contact, index) => (
          <div
            key={`${contact.phone}-${index}`}
            onClick={() => onToggleContact(contact.phone)}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div 
                className={`w-5 h-5 rounded border flex items-center justify-center
                  ${selectedContacts.has(contact.phone) 
                    ? 'bg-primary border-primary' 
                    : 'border-input'
                  }`}
              >
                {selectedContacts.has(contact.phone) && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="w-3 h-3 text-primary-foreground"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}