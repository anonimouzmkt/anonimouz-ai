import { supabase } from "@/integrations/supabase/client";

export class BaseService {
  protected baseUrl: string = "https://anonimouz-ai.lovable.app/api";
  protected accessToken: string | null = null;

  constructor() {
    console.log('Base Service initialized with URL:', this.baseUrl);
  }

  protected async getAuthHeaders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('unique_id')
      .eq('id', user.id)
      .single();

    if (!profile?.unique_id) throw new Error('No unique_id found for user');

    // Get a fresh session to ensure we have a valid JWT
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get valid session');
    }

    this.accessToken = session.access_token;
    console.log('Generated new JWT token for API request');

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'x-unique-id': profile.unique_id
    };
  }
}