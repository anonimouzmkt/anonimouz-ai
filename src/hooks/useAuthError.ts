import { AuthError } from "@supabase/supabase-js";
import { useTranslation } from "@/hooks/useTranslation";

export const useAuthError = () => {
  const { t } = useTranslation();

  const getErrorMessage = (error: AuthError) => {
    try {
      const errorMessage = JSON.parse(error.message);
      switch (errorMessage.code) {
        case "invalid_credentials":
          return t("invalidCredentials");
        case "email_not_confirmed":
          return t("emailNotConfirmed");
        default:
          return errorMessage.message;
      }
    } catch {
      return error.message;
    }
  };

  return { getErrorMessage };
};