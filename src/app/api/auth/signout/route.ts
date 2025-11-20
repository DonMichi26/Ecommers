import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}