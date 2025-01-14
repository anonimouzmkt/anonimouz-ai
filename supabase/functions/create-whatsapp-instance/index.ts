import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { name } = await req.json()
    const apiKey = Deno.env.get('WHATSAPP_API_KEY')
    
    console.log('Creating WhatsApp instance:', name)

    const response = await fetch('https://evo2.anonimouz.com/instance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey || '',
      },
      body: JSON.stringify({
        instanceName: name,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    // Verificar se a resposta foi bem sucedida
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to create WhatsApp instance')
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})