import { createClient } from '@supabase/supabase-js'

// Cliente para usar en el servidor (server components, API routes, server actions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Crear cliente con valores por defecto si no están configurados (para desarrollo)
// Esto evita que la app se rompa mientras configuras Supabase
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, key)

// Función helper para verificar si Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Para operaciones del servidor, puedes usar la service role key si necesitas bypass de RLS
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!)

