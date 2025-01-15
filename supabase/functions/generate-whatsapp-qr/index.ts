import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { instanceName } = await req.json()
    const apiKey = Deno.env.get('WHATSAPP_API_KEY')
    
    console.log('Generating QR code for instance:', instanceName)
    console.log('API Key present:', !!apiKey)

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

    // Generate a unique instance name by appending a timestamp
    const uniqueInstanceName = `${instanceName}_${Date.now()}`
    console.log('Using unique instance name:', uniqueInstanceName)

    const response = await fetch('https://evo2.anonimouz.com/instance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        instanceName: uniqueInstanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    // Check if the response was successful
    if (!response.ok) {
      console.error('API Error:', data)
      let errorMessage = 'Unknown error occurred'
      
      // Handle specific error cases
      if (data.response?.message) {
        errorMessage = Array.isArray(data.response.message) 
          ? data.response.message.join(', ')
          : data.response.message
      }
      
      return new Response(
        JSON.stringify({ 
          error: `API Error: ${response.status} - ${errorMessage}`,
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