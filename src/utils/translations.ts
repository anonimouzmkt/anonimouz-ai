export const translations = {
  en: {
    // Settings
    settings: "Settings",
    accountInformation: "Account Information",
    email: "Email",
    uniqueId: "Unique ID",
    language: "Language",
    selectLanguage: "Select language",
    english: "English",
    portuguese: "Portuguese",
    theme: "Theme",
    security: "Security",
    changePassword: "Change Password",
    apiToken: "API Token",
    webhook: "Webhook",
    
    // Login
    login: "Login",
    signIn: "Sign in to continue",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    
    // Admin Settings
    adminSettings: "Admin Settings",
    adminMaster: "Admin Master",
    createNewAdmin: "Create new admin users with full system access.",
    adminEmail: "Admin Email",
    createAdminUser: "Create Admin User",
    userManagement: "User Management",
    manageUsers: "Manage user roles and permissions.",
    role: "Role",
    actions: "Actions",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    delete: "Delete",
    deleteConfirmation: "Are you absolutely sure?",
    deleteWarning: "This action cannot be undone. This will permanently delete the user account and all associated data including WhatsApp instances and dispatch history.",
    cancel: "Cancel",
    
    // Toasts
    success: "Success",
    error: "Error",
    languageUpdated: "Language updated successfully",
    errorUpdatingLanguage: "Error updating language",
  },
  "pt-BR": {
    // Settings
    settings: "Configurações",
    accountInformation: "Informações da Conta",
    email: "E-mail",
    uniqueId: "ID Único",
    language: "Idioma",
    selectLanguage: "Selecionar idioma",
    english: "Inglês",
    portuguese: "Português",
    theme: "Tema",
    security: "Segurança",
    changePassword: "Alterar Senha",
    apiToken: "Token API",
    webhook: "Webhook",
    
    // Login
    login: "Entrar",
    signIn: "Faça login para continuar",
    forgotPassword: "Esqueceu a senha?",
    noAccount: "Não tem uma conta?",
    signUp: "Cadastre-se",
    
    // Admin Settings
    adminSettings: "Configurações de Administrador",
    adminMaster: "Administrador Master",
    createNewAdmin: "Crie novos usuários administradores com acesso total ao sistema.",
    adminEmail: "E-mail do Administrador",
    createAdminUser: "Criar Usuário Administrador",
    userManagement: "Gerenciamento de Usuários",
    manageUsers: "Gerencie funções e permissões dos usuários.",
    role: "Função",
    actions: "Ações",
    makeAdmin: "Tornar Admin",
    removeAdmin: "Remover Admin",
    delete: "Excluir",
    deleteConfirmation: "Tem certeza absoluta?",
    deleteWarning: "Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta do usuário e todos os dados associados, incluindo instâncias do WhatsApp e histórico de envios.",
    cancel: "Cancelar",
    
    // Toasts
    success: "Sucesso",
    error: "Erro",
    languageUpdated: "Idioma atualizado com sucesso",
    errorUpdatingLanguage: "Erro ao atualizar idioma",
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;