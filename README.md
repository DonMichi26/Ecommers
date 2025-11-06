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

### Estructura del proyecto

```
Ecommers/
├── .env                          # Variables de entorno (Supabase keys) - NO SUBIR AL REPO
├── .gitignore                    # Archivos y carpetas ignorados por Git
├── eslint.config.mjs             # Configuración de ESLint (reglas de linting)
├── next.config.ts                # Configuración de Next.js (features, bundling)
├── next-env.d.ts                 # Tipos de Next.js (generado automáticamente)
├── package.json                  # Dependencias y scripts del proyecto
├── package-lock.json             # Versiones exactas de dependencias
├── postcss.config.mjs            # Configuración de PostCSS/Tailwind
├── tsconfig.json                 # Configuración de TypeScript
│
├── public/                        # Recursos estáticos (accesibles en /ruta)
│   ├── favicon.ico               # Icono de la pestaña del navegador
│   ├── next.svg                  # Logo de Next.js (puedes eliminar)
│   ├── vercel.svg                # Logo de Vercel (puedes eliminar)
│   └── ...                       # Otros archivos estáticos (imágenes, etc.)
│
├── prisma/                        # Configuración de Prisma (NO USADO - puedes eliminar)
│   ├── schema.prisma             # Schema de Prisma (no necesario con Supabase)
│   ├── seed.cjs                  # Script de seeding (no necesario con Supabase)
│   └── migrations/               # Migraciones de Prisma (no necesario)
│
└── src/                          # Código fuente de la aplicación
    │
    ├── app/                      # App Router de Next.js (rutas y páginas)
    │   │
    │   ├── layout.tsx             # Layout raíz (HTML base, metadata, fuentes)
    │   ├── page.tsx               # Página principal (/) - Listado de productos
    │   ├── globals.css            # Estilos globales y configuración de Tailwind
    │   ├── favicon.ico            # Icono de la app
    │   │
    │   ├── api/                   # API Routes (endpoints REST)
    │   │   └── products/
    │   │       ├── route.ts       # GET /api/products (listar) y POST /api/products (crear)
    │   │       └── [id]/
    │   │           └── route.ts   # GET/PUT/DELETE /api/products/[id] (operaciones por ID)
    │   │
    │   └── productos/             # Páginas de productos
    │       └── [id]/
    │           └── page.tsx       # Página de detalle de producto (/productos/[id])
    │
    ├── lib/                       # Utilidades y configuraciones compartidas
    │   └── supabase/
    │       ├── client.ts          # Cliente de Supabase para navegador (Client Components)
    │       └── server.ts          # Cliente de Supabase para servidor (Server Components, API Routes)
    │
    └── types/                     # Tipos TypeScript
        └── supabase.ts            # Tipos generados para las tablas de Supabase
```

### Descripción detallada de archivos y carpetas

#### **Raíz del proyecto**

- **`.env`**: Variables de entorno (Supabase URL y keys). **IMPORTANTE**: No subir al repositorio.
- **`.gitignore`**: Define qué archivos/carpetas Git debe ignorar (node_modules, .env, .next, etc.).
- **`package.json`**: Lista de dependencias y scripts npm (`dev`, `build`, `start`, etc.).
- **`tsconfig.json`**: Configuración de TypeScript (paths, strict mode, etc.).
- **`next.config.ts`**: Configuración de Next.js (experimental features, webpack, etc.).
- **`eslint.config.mjs`**: Reglas de linting para mantener código consistente.
- **`postcss.config.mjs`**: Configuración de PostCSS y Tailwind CSS.

#### **`public/`** - Recursos estáticos

Archivos accesibles directamente desde la URL (ej: `/next.svg`). Aquí van:
- Imágenes, iconos, SVGs
- Favicon
- Archivos PDF, documentos, etc.

#### **`src/app/`** - App Router de Next.js

Cada carpeta/archivo aquí define una ruta en tu aplicación:

- **`layout.tsx`**: Layout raíz que envuelve todas las páginas. Define el `<html>`, `<body>`, metadata global, fuentes.
- **`page.tsx`**: Página principal en `/` - Muestra el listado de productos.
- **`globals.css`**: Estilos globales, variables CSS, configuración de Tailwind.
- **`api/`**: API Routes - Endpoints REST que puedes llamar desde el frontend o externamente.
  - `api/products/route.ts`: Maneja GET (listar) y POST (crear) productos.
  - `api/products/[id]/route.ts`: Maneja GET (obtener), PUT (actualizar) y DELETE (eliminar) un producto específico.
- **`productos/[id]/page.tsx`**: Página dinámica para mostrar el detalle de un producto. La ruta es `/productos/[id]` donde `[id]` es el ID del producto.

#### **`src/lib/`** - Utilidades y configuraciones

Código reutilizable y configuraciones:

- **`lib/supabase/client.ts`**: Cliente de Supabase para usar en **Client Components** (componentes que se ejecutan en el navegador). Usa `'use client'`.
- **`lib/supabase/server.ts`**: Cliente de Supabase para usar en **Server Components** y **API Routes** (código que se ejecuta en el servidor).

#### **`src/types/`** - Tipos TypeScript

- **`types/supabase.ts`**: Tipos TypeScript generados para las tablas de Supabase. Te da autocompletado y type safety al trabajar con la base de datos.

#### **`prisma/`** - (Opcional - puedes eliminar)

Carpeta de Prisma que ya no se usa porque estamos usando Supabase directamente. Puedes eliminar esta carpeta si quieres.

### Guía rápida para hacer cambios

**Para agregar una nueva página:**
- Crea una carpeta en `src/app/` con el nombre de la ruta (ej: `src/app/carrito/page.tsx` → `/carrito`)
- Crea un archivo `page.tsx` dentro de esa carpeta

**Para agregar un nuevo endpoint API:**
- Crea una carpeta en `src/app/api/` con el nombre del recurso (ej: `src/app/api/cart/route.ts` → `/api/cart`)
- Crea un archivo `route.ts` con las funciones `GET`, `POST`, `PUT`, `DELETE`, etc.

**Para agregar componentes reutilizables:**
- Crea una carpeta `src/components/` y agrega tus componentes ahí
- Importa desde `@/components/nombre-componente`

**Para agregar utilidades:**
- Crea archivos en `src/lib/` (ej: `src/lib/utils.ts`, `src/lib/format.ts`)

**Para usar Supabase:**
- En Server Components o API Routes: `import { supabase } from '@/lib/supabase/server'`
- En Client Components: `import { supabase } from '@/lib/supabase/client'` (y agrega `'use client'` al inicio del archivo)

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
