import { ContactList } from "@/components/ContactList";

interface Contact {
  name: string;
  phone: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

interface ContactSectionProps {
  contacts: Contact[];
}

export function ContactSection({ contacts }: ContactSectionProps) {
  return (
    <div className="bg-card p-6 rounded-lg">
      <div className="space-y-4">
        <div>
          <p className="text-card-foreground">
            Contatos carregados para{" "}
            <span className="font-bold">disparo</span>
          </p>
          <p className="text-card-foreground mt-2">
            <span className="font-bold">{contacts.length}</span>{" "}
            contato(s) total
          </p>
        </div>
        <ContactList contacts={contacts} />
      </div>
    </div>
  );
}