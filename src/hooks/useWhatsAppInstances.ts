import { useWhatsAppInstance } from "./whatsapp/useWhatsAppInstance";
import { useCreateInstance } from "./whatsapp/useCreateInstance";
import { useDeleteInstance } from "./whatsapp/useDeleteInstance";

export const useWhatsAppInstances = () => {
  const { instances, refetch } = useWhatsAppInstance();
  const { createInstance } = useCreateInstance(refetch);
  const { deleteInstance } = useDeleteInstance(refetch);

  return {
    instances,
    createInstance,
    deleteInstance,
    refetch,
  };
};