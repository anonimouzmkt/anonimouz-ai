import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  isAI: boolean;
}

export function MessageInput({ message, onMessageChange, isAI }: MessageInputProps) {
  return (
    <div>
      <div>
        <h2 className="text-card-foreground mb-1">
          Digite a mensagem inicial do <span className="font-bold">{isAI ? "Agent" : "disparo"}</span>
        </h2>
        <p className="text-primary text-sm">
          Exemplo: "Olá [[nome]], tudo bem?"
        </p>
      </div>
      <Textarea
        placeholder="Digite sua mensagem de disparo"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        className="min-h-[100px] mt-4"
      />
    </div>
  );
}