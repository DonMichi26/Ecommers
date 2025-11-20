import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

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
      return Response.json({ error: error.message }, { status: 400 });
    }

    // Enviar email de bienvenida
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`, {
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

    return Response.json(data);
  } catch (error) {
    console.error('Sign up error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}