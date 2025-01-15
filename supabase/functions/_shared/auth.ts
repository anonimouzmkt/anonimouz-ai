import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRole)

export async function validateAuth(req: Request): Promise<{ user_id: string | null; error?: string }> {
  try {
    // First try API Key authentication
    const apiKey = req.headers.get('apikey')
    if (apiKey) {
      console.log('Attempting API Key authentication')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('api_key', apiKey)
        .single()

      if (profileError) {
        console.error('API Key authentication failed:', profileError)
        throw new Error('Invalid API Key')
      }

      if (profile) {
        console.log('API Key authentication successful')
        return { user_id: profile.id }
      }
    }

    // If no API Key or API Key auth failed, try JWT authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authentication provided')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Attempting JWT authentication')

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      console.error('JWT authentication failed:', error)
      throw error
    }

    if (!user) {
      throw new Error('User not found')
    }

    console.log('JWT authentication successful')
    return { user_id: user.id }

  } catch (error) {
    console.error('Authentication error:', error)
    return { 
      user_id: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}

export function handleAuthError(error: string): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: error
    }),
    {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}