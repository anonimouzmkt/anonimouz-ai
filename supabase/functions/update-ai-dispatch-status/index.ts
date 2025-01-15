import { serve } from "https://deno.fresh.run/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Update AI Dispatch Status function started")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dispatchId, phone, status } = await req.json()
    console.log('Updating AI dispatch status:', { dispatchId, phone, status })

    // Update the AI dispatch status in the database
    const { data, error } = await supabase
      .from('dispatch_results')
      .update({ status })
      .eq('id', dispatchId)
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
