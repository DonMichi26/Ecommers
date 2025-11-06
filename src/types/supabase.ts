// Tipos TypeScript para las tablas de Supabase
// Puedes generar estos automáticamente con:
// npx supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          image_url: string | null
          stock: number
          category_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          image_url?: string | null
          stock?: number
          category_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stock?: number
          category_id?: string | null
          created_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          total: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          total: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          total?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          quantity: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          quantity?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          quantity?: number
          created_at?: string | null
        }
      }
    }
  }
}

// Tipos auxiliares para facilitar el uso
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']

export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

