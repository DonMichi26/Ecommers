// --- Configuración y creación del cliente Supabase ---
import { createClient } from '@supabase/supabase-js';

// Obtención de variables de entorno necesarias para conectar con Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si faltan las variables de entorno, lanzamos un error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente Supabase listo para usarse en el resto del proyecto
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------- Funciones de Autenticación y Perfil ----------------------

// Obtiene el usuario actual mediante una llamada a la API local
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me'); // Solicita la info del usuario actual
    if (!response.ok) {
      if (response.status === 401) {
        return null; // No hay usuario autenticado
      }
      throw new Error('Error getting current user');
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Registra un nuevo usuario (email, contraseña y nombre)
// Envía también un email de bienvenida usando la API interna
export async function signUp(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Intento de enviar un email de bienvenida (opcional, no detiene el registro)
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
      });
    } catch (emailError) {
      console.error('Error al enviar email de bienvenida:', emailError);
      // No lanzamos error porque el registro fue exitoso
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Inicia sesión con correo y contraseña
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Cierra la sesión del usuario
// Realiza signOut en supabase y también limpia la sesión del servidor
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // Llama la API para limpiar sesión en el servidor también
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
    } catch (apiError) {
      console.error('Error calling signout API:', apiError);
    }

    return { message: 'Signed out successfully' };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Definición del tipo de datos que se pueden actualizar en el perfil de usuario
export interface UserProfileUpdate {
  name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
}

// Actualiza información del perfil de usuario en la tabla "profiles"
export async function updateUserProfile(userId: string, updates: Partial<UserProfileUpdate>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single(); // Devuelve solo el perfil actualizado

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Obtiene el perfil de usuario desde la tabla "profiles" mediante ID
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single(); // Devuelve solo el perfil encontrado

  if (error) {
    throw new Error(error.message);
  }

  return data;
}