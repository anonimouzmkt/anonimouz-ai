import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { validateAuth } from '../_shared/auth.ts'

console.log("Hello from update-dispatch-status!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate authentication
    const { user_id, error: authError } = await validateAuth(req)
    if (authError) {
      throw new Error(authError)
    }

    // Get request body
    const { dispatchId, phone, status, error } = await req.json()
    console.log(`Updating status for dispatch ${dispatchId}, phone ${phone} to ${status}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update dispatch contact result
    const { data, error: updateError } = await supabase
      .from('dispatch_contact_results')
      .update({
        status: status,
        error_message: error,
        updated_at: new Date().toISOString()
      })
      .eq('dispatch_id', dispatchId)
      .eq('contact_phone', phone)

    if (updateError) {
      throw updateError
    }

    // Update dispatch result counts
    const { data: dispatchData, error: countError } = await supabase
      .from('dispatch_contact_results')
      .select('status', { count: 'exact' })
      .eq('dispatch_id', dispatchId)
      .in('status', ['success', 'error'])
      .or('status.eq.success,status.eq.error')

    if (countError) {
      throw countError
    }

    const successCount = dispatchData?.filter(r => r.status === 'success').length || 0
    const errorCount = dispatchData?.filter(r => r.status === 'error').length || 0

    const { error: updateDispatchError } = await supabase
      .from('dispatch_results')
      .update({
        success_count: successCount,
        error_count: errorCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', dispatchId)

    if (updateDispatchError) {
      throw updateDispatchError
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})