import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppInstance {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "connecting";
  qr_code: string | null;
}

const WhatsApp = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: instances, refetch } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WhatsAppInstance[];
    },
  });

  const handleCreateInstance = async () => {
    setIsCreating(true);
    try {
      const { error } = await supabase.from("whatsapp_instances").insert({
        name: `Instance ${(instances?.length || 0) + 1}`,
        status: "disconnected",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp instance created successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error creating instance:", error);
      toast({
        title: "Error",
        description: "Failed to create WhatsApp instance",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="flex-1 p-6 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-[#222222] rounded-lg p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">WhatsApp</h1>
            <p className="text-gray-400">
              Gerencie suas instâncias do WhatsApp
            </p>
          </div>
          <Button
            onClick={handleCreateInstance}
            disabled={isCreating}
            className="bg-[#0099ff] hover:bg-[#0088ee]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances?.map((instance) => (
            <div
              key={instance.id}
              className="bg-[#222222] p-4 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {instance.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    instance.status === "connected"
                      ? "bg-green-500/20 text-green-500"
                      : instance.status === "connecting"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {instance.status}
                </span>
              </div>
              {instance.qr_code && (
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={instance.qr_code}
                    alt="QR Code"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default WhatsApp;