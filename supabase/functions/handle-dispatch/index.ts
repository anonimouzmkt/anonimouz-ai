import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Handle Dispatch function started")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dispatchId, message, contacts } = await req.json()
    console.log('Handling dispatch:', { dispatchId, contactCount: contacts?.length })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the dispatch details
    const { data: dispatch, error: dispatchError } = await supabaseClient
      .from('dispatch_results')
      .select('*')
      .eq('id', dispatchId)
      .single()

    if (dispatchError) {
      throw dispatchError
    }

    if (!dispatch) {
      throw new Error('Dispatch not found')
    }

    // Get the WhatsApp instance
    const { data: instance, error: instanceError } = await supabaseClient
      .from('whatsapp_instances')
      .select('*')
      .eq('id', dispatch.instance_id)
      .single()

    if (instanceError) {
      throw instanceError
    }

    if (!instance) {
      throw new Error('WhatsApp instance not found')
    }

    // Create contact results
    const contactResults = contacts.map(contact => ({
      dispatch_id: dispatchId,
      contact_name: contact.name,
      contact_phone: contact.phone,
      status: 'pending'
    }))

    const { error: contactResultsError } = await supabaseClient
      .from('dispatch_contact_results')
      .insert(contactResults)

    if (contactResultsError) {
      throw contactResultsError
    }

    // Update dispatch status
    const { error: updateError } = await supabaseClient
      .from('dispatch_results')
      .update({ status: 'processing' })
      .eq('id', dispatchId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})