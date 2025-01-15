export type Language = "en" | "pt-BR";

export type TranslationKey =
  | "language"
  | "selectLanguage"
  | "english"
  | "portuguese"
  | "success"
  | "error"
  | "languageUpdated"
  | "errorUpdatingLanguage"
  | "settings"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "welcomeBack"
  | "signIn";

export const translations = {
  en: {
    language: "Language",
    selectLanguage: "Select language",
    english: "English",
    portuguese: "Portuguese",
    success: "Success",
    error: "Error",
    languageUpdated: "Language updated successfully",
    errorUpdatingLanguage: "Error updating language",
    settings: "Settings",
    invalidCredentials: "Invalid email or password",
    emailNotConfirmed: "Please confirm your email address",
    welcomeBack: "Welcome back",
    signIn: "Sign in to your account",
  },
  "pt-BR": {
    language: "Idioma",
    selectLanguage: "Selecione o idioma",
    english: "Inglês",
    portuguese: "Português",
    success: "Sucesso",
    error: "Erro",
    languageUpdated: "Idioma atualizado com sucesso",
    errorUpdatingLanguage: "Erro ao atualizar idioma",
    settings: "Configurações",
    invalidCredentials: "Email ou senha inválidos",
    emailNotConfirmed: "Por favor, confirme seu email",
    welcomeBack: "Bem-vindo de volta",
    signIn: "Entre na sua conta",
  },
};