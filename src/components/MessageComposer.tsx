import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="context">AI Context</Label>
        <Textarea
          id="context"
          placeholder="Provide context for the AI (e.g., 'This is a promotional message for our new product launch')"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
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