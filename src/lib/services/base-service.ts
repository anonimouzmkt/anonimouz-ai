import { supabase } from "@/integrations/supabase/client";

export class BaseService {
  protected baseUrl: string = "https://anonimouz-ai.lovable.app/api";
  protected accessToken: string | null = null;

  constructor() {
    this.initializeToken();
    console.log('Base Service initialized with URL:', this.baseUrl);
  }

  protected async initializeToken() {
    const { data: { session } } = await supabase.auth.getSession();
    this.accessToken = session?.access_token || null;
    console.log('Token initialized:', this.accessToken ? 'Token present' : 'No token');
  }

  protected async refreshTokenIfNeeded() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        this.accessToken = data.session?.access_token || null;
        console.log('Token refreshed:', this.accessToken ? 'New token obtained' : 'Failed to refresh');
      } else {
        this.accessToken = session.access_token;
        console.log('Using existing valid token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  protected async getAuthHeaders() {
    await this.refreshTokenIfNeeded();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', user.id)
      .single();

    if (!profile?.unique_id) throw new Error('No unique_id found for user');

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'x-unique-id': profile.unique_id
    };
  }
}