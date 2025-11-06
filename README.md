Proyecto e‑commerce con Next.js + TypeScript + Tailwind + Supabase

### Configuración inicial

1. **Crea un proyecto en Supabase**: https://app.supabase.com
2. **Configura las variables de entorno**: Crea un archivo `.env` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

   Puedes encontrar estos valores en: Tu proyecto → Settings → API

3. **Crea las tablas en Supabase**: Ve a SQL Editor y ejecuta el script de creación de tablas (ver sección "Base de datos" más abajo).

### Cómo ejecutar

```bash
# instalar dependencias
npm install

# levantar el servidor de desarrollo
npm run dev
```

Abre `http://localhost:3000` en el navegador.

### Scripts útiles

- `npm run dev`: inicia Next.js en desarrollo.
- `npm run build`: compila la app.
- `npm start`: arranca la app compilada.
- `npm run lint`: ejecuta ESLint.

### Estructura del proyecto (¿para qué sirve cada archivo?)

**Configuración**
- `next.config.ts`: configuración de Next.js (features, bundling, etc.).
- `eslint.config.mjs`: reglas de linting del proyecto.
- `postcss.config.mjs`: configuración de PostCSS/Tailwind.
- `tsconfig.json`: configuración de TypeScript.
- `.env`: variables de entorno (Supabase URL y keys). **No lo subas al repo**.
- `.gitignore`: ignora archivos que no deben versionarse.

**Frontend**
- `src/app/layout.tsx`: layout raíz de la app (HTML base, fuentes, providers).
- `src/app/globals.css`: estilos globales y Tailwind.
- `src/app/page.tsx`: página de inicio; punto de partida del catálogo.
- `public/…`: recursos estáticos (imágenes, SVGs, favicon, etc.).

**Backend (API Routes)**
- `src/app/api/products/route.ts`: endpoints para listar y crear productos (GET, POST).
- `src/app/api/products/[id]/route.ts`: endpoints para un producto específico (GET, PUT, DELETE).

**Supabase (Base de datos)**
- `src/lib/supabase/client.ts`: cliente de Supabase para usar en componentes del navegador.
- `src/lib/supabase/server.ts`: cliente de Supabase para usar en el servidor (API routes, server components).

### Base de datos (Supabase)

**Crear las tablas**: Ve a SQL Editor en Supabase y ejecuta este script:

```sql
-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- precio en centavos
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (opcional, si usas auth de Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, PAID, SHIPPED, CANCELLED
  total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

-- Tabla de carrito
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
```

### Ejemplos de uso

**En un API Route (servidor):**
```typescript
import { supabase } from '@/lib/supabase/server'

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) throw error
  return Response.json(data)
}
```

**En un componente del cliente:**
```typescript
'use client'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Products() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => {
      setProducts(data || [])
    })
  }, [])
  
  return <div>{/* render productos */}</div>
}
```

### Notas y buenas prácticas

- **Variables de entorno**: Asegúrate de tener `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en tu `.env`.
- **Row Level Security (RLS)**: Por defecto, Supabase tiene RLS activado. Configura las políticas en Supabase Dashboard → Authentication → Policies.
- **Tipos TypeScript**: Puedes generar tipos automáticamente con `npx supabase gen types typescript --project-id tu-project-id > src/types/supabase.ts`
