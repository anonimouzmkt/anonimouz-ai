import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-unique-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Authorization failed',
          details: 'Missing authorization header'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    const uniqueId = req.headers.get('x-unique-id');
    if (!uniqueId) {
      console.error('Missing x-unique-id header');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required header',
          details: 'x-unique-id header is required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('unique_id', uniqueId)
      .single();

    if (profileError || !profile) {
      console.error('Invalid unique_id:', uniqueId);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid unique_id',
          details: 'The provided unique_id does not match any user profile'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    const body = await req.json()
    console.log('Received webhook payload:', body)

    const { instanceName, status, event } = body
    if (!instanceName) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid payload',
          details: 'instanceName is required in webhook payload'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // If it's a connection event or status is provided, update the instance status
    if (event === 'connection' || status) {
      const newStatus = status || (event === 'connection' ? 'connected' : null);
      
      if (newStatus) {
        console.log(`Attempting to update instance ${instanceName} status to ${newStatus}`);
        
        // First, get the instance to update
        const { data: instances, error: fetchError } = await supabaseClient
          .from('whatsapp_instances')
          .select('id, status')
          .eq('name', instanceName);

        if (fetchError) {
          console.error('Error fetching instance:', fetchError);
          throw fetchError;
        }

        if (!instances || instances.length === 0) {
          console.error(`No instance found with name: ${instanceName}`);
          return new Response(
            JSON.stringify({ 
              error: 'Instance not found',
              details: `No instance found with name ${instanceName}`
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404
            }
          )
        }

        const instance = instances[0];
        console.log(`Found instance with id ${instance.id}, current status: ${instance.status}`);

        // Perform the update
        const { error: updateError } = await supabaseClient
          .from('whatsapp_instances')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', instance.id);

        if (updateError) {
          console.error('Error updating instance status:', updateError);
          throw updateError;
        }

        // Verify the update
        const { data: verifyInstance, error: verifyError } = await supabaseClient
          .from('whatsapp_instances')
          .select('status')
          .eq('id', instance.id)
          .single();

        if (verifyError) {
          console.error('Error verifying update:', verifyError);
          throw verifyError;
        }

        console.log(`Instance status after update: ${verifyInstance.status}`);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: `Instance ${instanceName} status updated to ${newStatus}`,
            data: {
              instanceName,
              status: newStatus,
              timestamp: new Date().toISOString()
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // For non-connection events, just acknowledge receipt
    console.log(`Received ${event} event for instance ${instanceName}`);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed ${event} event for instance: ${instanceName}`,
        data: {
          instanceName,
          event,
          status,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})