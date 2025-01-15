import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function validateApiKey(apiKey: string | null): Promise<string | null> {
  if (!apiKey) {
    console.error('No API key provided');
    return null;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Validating API key:', apiKey);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (error || !profile) {
      console.error('Error validating API key:', error);
      return null;
    }

    console.log('API key validated for user:', profile.id);
    return profile.id;
  } catch (error) {
    console.error('Error in validateApiKey:', error);
    return null;
  }
}