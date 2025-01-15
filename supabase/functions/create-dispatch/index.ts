import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { validateApiKey } from "../_shared/auth.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    const userId = await validateApiKey(apiKey);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { message, instanceId, isAiDispatch, aiContext, contacts } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create dispatch record
    const { data: dispatch, error: dispatchError } = await supabase
      .from('dispatch_results')
      .insert({
        user_id: userId,
        instance_id: instanceId,
        total_contacts: contacts.length,
        is_ai_dispatch: isAiDispatch,
        initial_message: message,
        ai_context: aiContext
      })
      .select()
      .single();

    if (dispatchError) throw dispatchError;

    // Create contact results
    const { error: contactsError } = await supabase
      .from('dispatch_contact_results')
      .insert(
        contacts.map(contact => ({
          dispatch_id: dispatch.id,
          contact_name: contact.name,
          contact_phone: contact.phone,
          status: 'pending'
        }))
      );

    if (contactsError) throw contactsError;

    console.log('Dispatch created successfully:', dispatch.id);

    return new Response(
      JSON.stringify({ id: dispatch.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-dispatch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});