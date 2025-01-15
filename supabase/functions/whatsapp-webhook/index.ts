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

    const { instanceName, status } = body
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

    if (status) {
      console.log(`Attempting to update instance ${instanceName} status to ${status}`);
      
      const { data: instance, error: fetchError } = await supabaseClient
        .from('whatsapp_instances')
        .select('id, status')
        .eq('name', instanceName)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching instance:', fetchError);
        throw fetchError;
      }

      if (!instance) {
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

      console.log(`Found instance with id ${instance.id}, current status: ${instance.status}`);

      const { error: updateError } = await supabaseClient.rpc('update_instance_status', {
        p_instance_id: instance.id,
        p_status: status
      });

      if (updateError) {
        console.error('Error updating instance status:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Instance ${instanceName} status updated to ${status}`,
          data: {
            instanceName,
            status,
            timestamp: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed event for instance: ${instanceName}`,
        data: {
          instanceName,
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