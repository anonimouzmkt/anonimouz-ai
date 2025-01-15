import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Received webhook payload:', body)

    // Extract instance data from webhook
    const { instanceName, status, event } = body

    if (!instanceName) {
      throw new Error('Instance name is required in webhook payload')
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

      if (updateError) {
        console.error('Error updating instance status:', updateError)
        throw updateError
      }

      console.log(`Successfully updated status for instance ${instanceName}`)
    } else {
      console.log(`Ignoring webhook event: ${event} for instance ${instanceName}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Processed webhook for instance: ${instanceName}`
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
        error: error.message,
        details: 'Failed to process webhook request'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})