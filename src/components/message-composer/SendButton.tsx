import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <Button
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
      onClick={onClick}
      disabled={disabled}
    >
      <Send className="w-5 h-5 mr-2" />
      Disparar mensagens
    </Button>
  );
}