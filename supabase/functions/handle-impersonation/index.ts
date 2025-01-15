import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the current user is an admin
    const { data: { user: adminUser }, error: adminError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (adminError || !adminUser) {
      throw new Error('Unauthorized')
    }

    // Check if the user is an admin
    const { data: adminProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()
    
    if (profileError || adminProfile?.role !== 'admin_user') {
      throw new Error('Unauthorized - Admin access required')
    }

    // Get the user to impersonate from the request body
    const { impersonatedUserId } = await req.json()
    if (!impersonatedUserId) {
      throw new Error('No user ID provided')
    }

    // Create a new session for the impersonated user
    const { data: { session }, error: signInError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: (await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', impersonatedUserId)
        .single()).data?.email || '',
    })

    if (signInError || !session) {
      throw new Error('Failed to generate session')
    }

    return new Response(
      JSON.stringify({ 
        access_token: session.access_token,
        refresh_token: session.refresh_token
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})