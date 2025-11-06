import { supabase, isSupabaseConfigured } from '@/lib/supabase/server'
import { Product } from '@/types/supabase'
import Image from 'next/image'
import Link from 'next/link'

// --- Función para obtener productos ---
async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase no está configurado. Configura las variables de entorno en .env')
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

// --- Función para formatear precios ---
function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100)
}

// --- Componente Principal ---
export default async function Home() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-amber-50"> {/* Fondo cálido para muebles */}
      {/* Header */}
      <header className="bg-white border-b border-amber-200"> {/* Color de borde acorde */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-amber-900">Muebles & Co.</h1> {/* Nombre de la tienda */}
          <p className="text-amber-700 mt-1">Diseño elegante para tu hogar</p> {/* Subtítulo */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12 text-center"> {/* Sección de encabezado de productos */}
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Colección Destacada
          </h2>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Descubre muebles únicos y de alta calidad que transformarán tu espacio en un refugio acogedor.
          </p>
        </div>

        {/* Products Grid */}
        {!isSupabaseConfigured() ? (
          <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-yellow-900 mb-4">
              ⚠️ Configuración de Supabase requerida
            </h3>
            <p className="text-yellow-800 mb-4">
              Para que la aplicación funcione, necesitas configurar las variables de entorno de Supabase.
            </p>
            <div className="text-left max-w-2xl mx-auto bg-white p-6 rounded-lg border border-yellow-300">
              <p className="font-semibold text-yellow-900 mb-2">Pasos a seguir:</p>
              <ol className="list-decimal list-inside space-y-2 text-yellow-800 text-sm">
                <li>Crea un proyecto en <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase</a></li>
                <li>Ve a Settings → API en tu proyecto</li>
                <li>Copia la <strong>Project URL</strong> y la <strong>anon public key</strong></li>
                <li>Agrega estas variables a tu archivo <code className="bg-yellow-100 px-1 rounded">.env</code>:</li>
              </ol>
              <pre className="mt-4 p-4 bg-zinc-900 text-green-400 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui`}
              </pre>
              <p className="mt-4 text-sm text-yellow-700">
                Después de configurar las variables, reinicia el servidor de desarrollo (<code className="bg-yellow-100 px-1 rounded">npm run dev</code>).
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-amber-600 mb-4">
              No hay muebles disponibles en este momento.
            </p>
            <p className="text-sm text-amber-500">
              Asegúrate de haber creado las tablas en Supabase y agregado productos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Espaciado aumentado */}
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`} // Asegúrate de que esta ruta coincida con tu estructura de app
                className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow duration-300" // Bordes y sombras más suaves
              >
                <div className="aspect-square relative bg-amber-100"> {/* Fondo de imagen acorde */}
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover object-center" // Centrado de imagen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-400">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5"> {/* Padding aumentado */}
                  <h3 className="font-semibold text-lg text-amber-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-amber-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        En stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer Simple */}
      <footer className="bg-amber-900 text-amber-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Muebles & Co. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}