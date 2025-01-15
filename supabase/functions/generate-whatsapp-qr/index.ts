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

    // Get QR code for existing instance
    const response = await fetch(`https://evo2.anonimouz.com/instance/connect/${instanceName}`, {
      headers: {
        'apikey': apiKey,
      }
    })

    const data = await response.json()
    console.log('API Response:', data)

    if (!response.ok) {
      console.error('API Error:', data)
      return new Response(
        JSON.stringify({ 
          error: `API Error: ${response.status}`,
          details: data 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status 
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})