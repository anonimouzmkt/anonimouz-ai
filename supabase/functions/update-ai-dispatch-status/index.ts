import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-unique-id',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const uniqueId = req.headers.get('x-unique-id');
    if (!uniqueId) {
      throw new Error('Missing x-unique-id header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate if unique_id exists in profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('unique_id', uniqueId)
      .single();

    if (profileError || !profile) {
      throw new Error('Invalid unique_id');
    }

    // Get request body
    const { dispatchId, phone, status, error } = await req.json();

    if (!dispatchId || !phone || !status) {
      throw new Error('Missing required fields');
    }

    console.log(`Updating status for dispatch ${dispatchId}, phone ${phone} to ${status}`);

    // Update the contact result
    const { error: updateError } = await supabaseClient
      .from('dispatch_contact_results')
      .update({
        status: status,
        error_message: error || null,
        updated_at: new Date().toISOString()
      })
      .eq('dispatch_id', dispatchId)
      .eq('contact_phone', phone);

    if (updateError) {
      console.error('Error updating contact result:', updateError);
      throw updateError;
    }

    // Update dispatch result counts
    const { data: results, error: countError } = await supabaseClient
      .from('dispatch_contact_results')
      .select('status')
      .eq('dispatch_id', dispatchId);

    if (countError) {
      console.error('Error getting contact results:', countError);
      throw countError;
    }

    const successCount = results?.filter(r => r.status === 'success').length || 0;
    const errorCount = results?.filter(r => r.status === 'error').length || 0;

    const { error: dispatchUpdateError } = await supabaseClient
      .from('dispatch_results')
      .update({
        success_count: successCount,
        error_count: errorCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', dispatchId);

    if (dispatchUpdateError) {
      console.error('Error updating dispatch result:', dispatchUpdateError);
      throw dispatchUpdateError;
    }

    console.log(`Successfully updated status for dispatch ${dispatchId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          status,
          successCount,
          errorCount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});