import { useState } from "react";

interface ValidationProps {
  selectedInstance: string;
  message: string;
  useAI: boolean;
  context: string;
}

export function useDispatchValidation() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFields = ({ selectedInstance, message, useAI, context }: ValidationProps) => {
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

    setValidationErrors(errors);
    return errors.length === 0;
  };

  return {
    validationErrors,
    validateFields
  };
}