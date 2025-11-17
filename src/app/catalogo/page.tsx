import { supabase } from '@/lib/supabase/server'
import { Product } from '@/types/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// --- Función para obtener productos ---
async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

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
export default async function CatalogPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-charcoal dark:text-off-white mb-4">
            Nuestro Catálogo
          </h1>
          <p className="text-charcoal/70 dark:text-off-white/70">
            Descubre nuestra colección de muebles minimalistas
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal/70 dark:text-off-white/70 text-lg">
              No hay productos disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link 
                href={`/productos/${product.id}`}
                key={product.id}
                className="group block"
              >
                <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm overflow-hidden border border-charcoal/10 dark:border-off-white/10 transition-all duration-300 group-hover:shadow-md">
                  <div className="relative aspect-[4/5] bg-charcoal/5 dark:bg-charcoal/10">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-charcoal/30 dark:text-off-white/30">
                          image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-charcoal dark:text-off-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-primary font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}