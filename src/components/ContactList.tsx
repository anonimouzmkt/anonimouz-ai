import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

interface ContactListProps {
  contacts: Contact[];
}

export function ContactList({ contacts }: ContactListProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

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
                {contact.error && (
                  <p className="text-sm text-destructive mt-1">{contact.error}</p>
                )}
              </div>
            </div>
            <div>{getStatusIcon(contact.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}