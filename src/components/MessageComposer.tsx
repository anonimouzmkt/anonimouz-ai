import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px]"
      />
      
      <Button 
        className="w-full"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
      >
        <Send className="w-4 h-4 mr-2" />
        Send Messages
      </Button>
    </div>
  );
}