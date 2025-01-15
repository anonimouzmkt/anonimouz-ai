import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("WhatsApp Webhook function started")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data = await req.json()
    console.log('Webhook received:', data)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (data.event === 'message') {
      const { instanceId, message } = data
      
      // Get the instance details
      const { data: instance, error: instanceError } = await supabaseClient
        .from('whatsapp_instances')
        .select('*')
        .eq('id', instanceId)
        .single()

      if (instanceError) {
        throw new Error(`Error fetching instance: ${instanceError.message}`)
      }

      // Update instance status if needed
      if (instance.status !== 'connected') {
        const { error: updateError } = await supabaseClient
          .from('whatsapp_instances')
          .update({ status: 'connected' })
          .eq('id', instanceId)

        if (updateError) {
          throw new Error(`Error updating instance status: ${updateError.message}`)
        }
      }

      // Store the message
      const { error: messageError } = await supabaseClient
        .from('whatsapp_messages')
        .insert([
          {
            instance_id: instanceId,
            message: message.body,
            from: message.from,
            to: message.to,
            message_type: message.type,
            timestamp: new Date().toISOString()
          }
        ])

      if (messageError) {
        throw new Error(`Error storing message: ${messageError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    )
  }
})