import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Webhook } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WebhookSectionProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  userId: string;
  refetch: () => void;
}

export const WebhookSection = ({ webhookUrl, setWebhookUrl, userId, refetch }: WebhookSectionProps) => {
  const handleSaveWebhookUrl = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_url: webhookUrl })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Webhook URL saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Failed to save webhook URL");
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Webhook URL</h2>
      <div className="flex gap-2">
        <Input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="Enter webhook URL..."
        />
        <Button onClick={handleSaveWebhookUrl}>
          <Webhook className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};