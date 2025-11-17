# Esquema de Base de Datos para E-commerce de Muebles

Basándonos en tu proyecto de e-commerce de muebles con autenticación, pedidos y panel de administración, aquí está el esquema optimizado de las tablas Supabase:

## Tabla `profiles`

Para almacenar información del perfil de usuario

```sql
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  phone text,
  address text,
  city text,
  postal_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Para que el panel de admins pueda ver todos los perfiles
create policy "Admins can view all profiles" on profiles
  for select using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `categories`

Para categorizar los productos de muebles

```sql
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

create policy "Anyone can view categories" on categories
  for select using (true);

create policy "Admins can manage categories" on categories
  for all using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `products`

Para almacenar información de los productos de muebles

```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price integer not null, -- Precio en céntimos (por ejemplo, 5999 = 59.99 €)
  image_url text,
  images_url text[], -- Array para almacenar múltiples imágenes
  stock integer default 0,
  category_id uuid references categories(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;

create policy "Anyone can view products" on products
  for select using (true);

create policy "Admins can manage products" on products
  for all using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `orders`

Para almacenar información de los pedidos

```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total integer not null, -- Total en céntimos
  shipping_cost integer default 500, -- Costo de envío en céntimos (5.00 €)
  tax_amount integer default 0, -- Impuestos en céntimos
  discount_amount integer default 0, -- Descuento en céntimos
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders enable row level security;

create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Admins can manage all orders" on orders
  for all using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `order_items`

Para almacenar los ítems de cada pedido

```sql
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  unit_price integer not null, -- Precio unitario en céntimos
  total_price integer not null, -- Precio total (cantidad * precio unitario) en céntimos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table order_items enable row level security;

create policy "Users can view own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items" on order_items
  for all using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `cart_items`

Para almacenar los ítems del carrito de compras

```sql
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_product unique (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users can manage own cart items" on cart_items
  for all using (auth.uid() = user_id);

create policy "Admins can view cart items" on cart_items
  for select using (
    auth.jwt() ->> 'email' like '%@admin.com'
  );
```

## Tabla `reviews`

Para almacenar reseñas de productos (opcional)

```sql
create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  title text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table reviews enable row level security;

create policy "Users can manage own reviews" on reviews
  for all using (auth.uid() = user_id);

create policy "Anyone can view reviews" on reviews
  for select using (true);
```

## Tabla `wishlist`

Para almacenar productos favoritos de usuarios (opcional)

```sql
create table wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_product_wishlist unique (user_id, product_id)
);

alter table wishlist enable row level security;

create policy "Users can manage own wishlist" on wishlist
  for all using (auth.uid() = user_id);

create policy "Anyone can view wishlist" on wishlist
  for select using (auth.uid() = user_id);
```

## Funciones de ayuda

```sql
-- Función para actualizar automáticamente la columna updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Aplicar la función a las tablas que tienen updated_at
create trigger handle_profiles_updated_at before update on profiles
  for each row execute procedure handle_updated_at();

create trigger handle_categories_updated_at before update on categories
  for each row execute procedure handle_updated_at();

create trigger handle_products_updated_at before update on products
  for each row execute procedure handle_updated_at();

create trigger handle_orders_updated_at before update on orders
  for each row execute procedure handle_updated_at();

create trigger handle_cart_items_updated_at before update on cart_items
  for each row execute procedure handle_updated_at();

create trigger handle_reviews_updated_at before update on reviews
  for each row execute procedure handle_updated_at();

create trigger handle_wishlist_updated_at before update on wishlist
  for each row execute procedure handle_updated_at();
```

## Configuración de RLS (Row Level Security)

```sql
-- Asegurarse de que RLS esté habilitado
alter table profiles force row level security;
alter table categories force row level security;
alter table products force row level security;
alter table orders force row level security;
alter table order_items force row level security;
alter table cart_items force row level security;
alter table reviews force row level security;
alter table wishlist force row level security;
```

## Índices para mejorar el rendimiento

```sql
-- Índices para búsquedas frecuentes
create index idx_products_category_id on products(category_id);
create index idx_products_name on products using gin(to_tsvector('spanish', name));
create index idx_products_created_at on products(created_at);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);
create index idx_cart_items_user_id on cart_items(user_id);
create index idx_review_product_id on reviews(product_id);
create index idx_wishlist_user_id on wishlist(user_id);
```

## Almacenamiento de imágenes

Para almacenar imágenes de productos, puedes usar el servicio de almacenamiento de Supabase (Supabase Storage) con las siguientes reglas:

### Crear bucket

1. Crear bucket llamado `product-images` en Supabase Storage
2. Configurar las reglas de acceso:

#### Reglas de almacenamiento

*   Permitir lectura pública de imágenes
*   Permitir carga de imágenes solo para usuarios autenticados o admins

```sql
-- Reglas de almacenamiento en Supabase Storage
-- Para permitir lectura pública
bucket_id = 'product-images'
public = true

-- Para permitir subida de imágenes por usuarios autenticados
create policy "Allow upload to authenticated users" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

create policy "Allow read access" on storage.objects
  for select using (
    bucket_id = 'product-images'
  );
```

Este esquema está optimizado para trabajar con tu e-commerce de muebles y soporta todas las funcionalidades implementadas: autenticación, carrito, pedidos, panel de administración, generación de facturas, etc.