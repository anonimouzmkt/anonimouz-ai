export type Language = "en" | "pt-BR";

export type TranslationKey =
  | "language"
  | "selectLanguage"
  | "english"
  | "portuguese"
  | "success"
  | "error"
  | "languageUpdated"
  | "errorUpdatingLanguage";

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
  },
};