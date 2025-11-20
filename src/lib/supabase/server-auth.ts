import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a server-side Supabase client
function createSupabaseServerClient() {
  const cookieStore = cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  // For server-side operations, we'll use the anon key with the user's token
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return supabase;
}

// Server function to get current user - use in Server Components only
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  
  if (!token) return null;

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
}

// Server function to get user profile
export async function getUserProfileServer(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Server function to update user profile
export async function updateUserProfileServer(userId: string, updates: any) {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}