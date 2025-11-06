import { supabase } from '@/lib/supabase/server'
import { Product } from '@/types/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100)
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a productos
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square relative bg-zinc-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <svg
                    className="w-24 h-24"
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

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-zinc-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-zinc-900 mb-2">
                    Descripción
                  </h2>
                  <p className="text-zinc-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {product.stock > 0 ? (
                    <>
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded font-medium">
                        En stock ({product.stock} disponibles)
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded font-medium">
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-zinc-200">
                <button
                  disabled={product.stock === 0}
                  className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Añadir al carrito' : 'Producto agotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

