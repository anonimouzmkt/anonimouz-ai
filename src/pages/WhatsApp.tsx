import { useState } from "react";
import { WhatsAppHeader } from "@/components/whatsapp/WhatsAppHeader";
import { InstanceList } from "@/components/whatsapp/InstanceList";
import { CreateInstanceDialog } from "@/components/whatsapp/CreateInstanceDialog";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";

const WhatsApp = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const { instances, createInstance, deleteInstance } = useWhatsAppInstances();

  const handleCreateInstance = async () => {
    setIsCreating(true);
    try {
      await createInstance(instanceName);
      setShowDialog(false);
      setInstanceName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <WhatsAppHeader onNewInstance={() => setShowDialog(true)} />
        <InstanceList 
          instances={instances || []} 
          onDelete={deleteInstance}
        />
      </div>

      <CreateInstanceDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        instanceName={instanceName}
        onInstanceNameChange={setInstanceName}
        onSubmit={handleCreateInstance}
        isCreating={isCreating}
      />
    </main>
  );
};

export default WhatsApp;