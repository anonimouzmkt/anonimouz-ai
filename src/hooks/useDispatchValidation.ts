import { useState } from "react";
import { Profile } from "@/integrations/supabase/types";

export function useDispatchValidation() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFields = (
    selectedInstance: string,
    message: string,
    useAI: boolean,
    context: string,
    profile?: Profile | null
  ) => {
    const errors: string[] = [];

    if (!selectedInstance) {
      errors.push("Selecione uma instância do WhatsApp");
    }

    if (!message.trim()) {
      errors.push("Digite uma mensagem inicial");
    }

    if (useAI && !context.trim()) {
      errors.push("Digite o contexto do disparo quando usar I.A");
    }

    if (useAI && !profile?.webhook_url) {
      errors.push("Configure o webhook de IA nas configurações");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  return {
    validationErrors,
    validateFields,
  };
}
