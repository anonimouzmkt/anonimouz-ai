// API base URL - pode ser substituído em produção
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.seu-dominio.com' 
  : 'https://udpmzsvvmdinsuwipvln.supabase.co/functions/v1';