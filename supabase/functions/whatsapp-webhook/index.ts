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
    // Validate Authorization header
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

    // Validate x-unique-id header
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

    // Validate if unique_id exists in profiles
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

    // Validate required fields in payload
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

    // If it's a connection event, update the instance status
    if (event === 'connection' || status === 'connected') {
      console.log(`Updating instance ${instanceName} status to connected`)
      
      const { error: updateError } = await supabaseClient
        .from('whatsapp_instances')
        .update({ 
          status: 'connected',
          updated_at: new Date().toISOString()
        })
        .eq('name', instanceName)
        .eq('user_id', profile.id);

      if (updateError) {
        console.error('Error updating instance status:', updateError)
        return new Response(
          JSON.stringify({ 
            error: 'Database error',
            details: 'Failed to update instance status'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }

      console.log(`Successfully updated status for instance ${instanceName}`)
      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Instance ${instanceName} status updated to connected`,
          data: {
            instanceName,
            status: 'connected',
            timestamp: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // For non-connection events, just acknowledge receipt
    console.log(`Received ${event} event for instance ${instanceName}`)
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
    console.error('Error processing webhook:', error)
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