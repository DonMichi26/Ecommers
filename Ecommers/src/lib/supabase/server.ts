import { createClient } from '@supabase/supabase-js'

// Cliente para usar en el servidor (server components, API routes, server actions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Revisa tu archivo .env')
}

// Para operaciones del servidor, puedes usar la service role key si necesitas bypass de RLS
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

