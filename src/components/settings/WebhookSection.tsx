import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Webhook } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface WebhookSectionProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  userId: string;
  refetch: () => void;
}

export const WebhookSection = ({ webhookUrl: initialWebhookUrl, setWebhookUrl, userId, refetch }: WebhookSectionProps) => {
  const [localWebhookUrl, setLocalWebhookUrl] = useState(initialWebhookUrl);

  useEffect(() => {
    setLocalWebhookUrl(initialWebhookUrl);
  }, [initialWebhookUrl, userId]);

  const handleSaveWebhookUrl = async () => {
    try {
      console.log('Saving webhook URL for user:', userId, 'URL:', localWebhookUrl);
      
      const { error } = await supabase
        .from("profiles")
        .update({ webhook_url: localWebhookUrl })
        .eq("id", userId);

      if (error) throw error;

      setWebhookUrl(localWebhookUrl);
      toast.success("Webhook URL saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Failed to save webhook URL");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Webhook URL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={localWebhookUrl}
            onChange={(e) => setLocalWebhookUrl(e.target.value)}
            placeholder="Enter webhook URL..."
            className="font-mono text-sm"
          />
          <Button onClick={handleSaveWebhookUrl}>
            <Webhook className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};