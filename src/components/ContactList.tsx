interface Contact {
  name: string;
  phone: string;
}

interface ContactListProps {
  contacts: Contact[];
}

export function ContactList({ contacts }: ContactListProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {contacts.map((contact, index) => (
          <div
            key={`${contact.phone}-${index}`}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
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