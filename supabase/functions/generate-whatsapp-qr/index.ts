import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { instanceName } = await req.json()
    const apiKey = Deno.env.get('WHATSAPP_API_KEY')
    
    console.log('Getting QR code for instance:', instanceName)

    if (!apiKey) {
      console.error('WHATSAPP_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const response = await fetch(`https://evo2.anonimouz.com/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    })

    const data = await response.json()
    console.log('API Response:', data)

    // Extrair apenas a parte base64 do QR code
    const qrCodeData = data.base64 ? data.base64.split(',')[1] : null;

    return new Response(
      JSON.stringify({ qrcode: qrCodeData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})