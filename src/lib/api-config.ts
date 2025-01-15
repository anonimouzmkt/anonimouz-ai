// API base URL - pode ser substituído em produção
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://app.anonimouz.com/api' 
  : '/api';