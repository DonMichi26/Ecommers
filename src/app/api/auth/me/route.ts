import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return Response.json({ error: 'No access token found' }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return Response.json({ error: 'Invalid access token' }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Error getting current user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}