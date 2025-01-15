import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { dispatchId, uniqueId, message, context, contacts } = await req.json();

    // Get the user's webhook URL based on their unique_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('webhook_url')
      .eq('unique_id', uniqueId)
      .single();

    if (profileError || !profile?.webhook_url) {
      console.error('Error fetching webhook URL:', profileError);
      return new Response(
        JSON.stringify({ error: 'Webhook URL not found for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward the request to the user's webhook
    console.log('Forwarding request to webhook:', profile.webhook_url);
    const webhookResponse = await fetch(profile.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dispatchId,
        uniqueId,
        message,
        context,
        contacts
      })
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.statusText}`);
    }

    const responseData = await webhookResponse.json();
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handle-dispatch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});