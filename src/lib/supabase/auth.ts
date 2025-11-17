import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para obtener usuario actual
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb-access-token')?.value
  
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

// Función para registro de usuario
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  // Enviar email de bienvenida
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: {
          email,
          name
        }
      })
    })
  } catch (emailError) {
    console.error('Error al enviar email de bienvenida:', emailError)
    // No lanzamos error porque el registro fue exitoso
  }

  return data
}

// Función para inicio de sesión
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Función para cierre de sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// Función para actualizar perfil de usuario
export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Función para obtener perfil de usuario
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}