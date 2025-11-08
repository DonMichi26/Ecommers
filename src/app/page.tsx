import { supabase, isSupabaseConfigured } from '@/lib/supabase/server'
import { Product } from '@/types/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// --- Función para obtener productos destacados ---
async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase no está configurado. Configura las variables de entorno en .env')
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)

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
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
              <div
                className="flex min-h-[480px] md:min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 text-center"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlU2LGddQIfoi9DyY419Fnz6GmOP7u0yrnSEYfeobqXgpjFQRYtAUso9H_YTmxdWDqWwIOgp9TddlXIRqO1v-s3mnr0yayRLOMfGSVmOwmzwnqVBVyxgyMAZJfU-lhTCAz7uBLliKXaFohlhahfsSSullCP9RBrou3RvFYCBe1JIKR7b8lmWcQbUC2zj_1sY-4x4nP5XfRVCr6GawpMLUrFCuk9HNw46MG7FMdwc37FKxzgRGm8lrYYJ5ua2Rv6FktSYFo0HqYmrDC")',
                }}
              >
                <div className="flex flex-col gap-4">
                  <h1 className="font-display text-white text-5xl font-bold leading-tight md:text-7xl">
                    Diseña Tu Espacio Perfecto
                  </h1>
                  <p className="text-white text-base font-normal leading-normal md:text-lg">
                    Muebles atemporales, entregados en tu puerta.
                  </p>
                </div>
                <Link
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-semibold leading-normal hover:bg-primary/90 transition-colors"
                  href="#productos"
                >
                  <span className="truncate">Ver Catálogo</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Productos Destacados */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="productos">
            <div className="mx-auto max-w-7xl">
              <h2 className="font-display text-charcoal dark:text-off-white text-4xl font-bold leading-tight px-4 pb-6">
                Nuestras Piezas Destacadas
              </h2>
              {!isSupabaseConfigured() ? (
                <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg p-8 mx-4">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-4">
                    ⚠️ Configuración de Supabase requerida
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    Para que la aplicación funcione, necesitas configurar las variables de entorno de Supabase.
                  </p>
                  <div className="text-left max-w-2xl mx-auto bg-white p-6 rounded-lg border border-yellow-300">
                    <p className="font-semibold text-yellow-900 mb-2">Pasos a seguir:</p>
                    <ol className="list-decimal list-inside space-y-2 text-yellow-800 text-sm">
                      <li>
                        Crea un proyecto en{' '}
                        <a
                          href="https://app.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Supabase
                        </a>
                      </li>
                      <li>Ve a Settings → API en tu proyecto</li>
                      <li>
                        Copia la <strong>Project URL</strong> y la <strong>anon public key</strong>
                      </li>
                      <li>
                        Agrega estas variables a tu archivo <code className="bg-yellow-100 px-1 rounded">.env</code>:
                      </li>
                    </ol>
                    <pre className="mt-4 p-4 bg-zinc-900 text-green-400 rounded text-xs overflow-x-auto">
                      {`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui`}
                    </pre>
                    <p className="mt-4 text-sm text-yellow-700">
                      Después de configurar las variables, reinicia el servidor de desarrollo (
                      <code className="bg-yellow-100 px-1 rounded">npm run dev</code>).
                    </p>
                  </div>
                </div>
              ) : featuredProducts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-charcoal/70 dark:text-off-white/70 mb-4">
                    No hay muebles disponibles en este momento.
                  </p>
                  <p className="text-sm text-charcoal/60 dark:text-off-white/60">
                    Asegúrate de haber creado las tablas en Supabase y agregado productos.
                  </p>
                </div>
              ) : (
                <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4">
                  <div className="flex items-stretch p-4 gap-6">
                    {featuredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-white dark:bg-background-dark shadow-sm min-w-64 md:min-w-72"
                      >
                        <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-t-xl relative overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-charcoal/10">
                              <span className="material-symbols-outlined text-6xl text-charcoal/30">
                                image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                          <div>
                            <p className="text-charcoal dark:text-off-white text-base font-medium leading-normal">
                              {product.name}
                            </p>
                            <p className="text-charcoal/70 dark:text-off-white/70 text-sm font-normal leading-normal">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <Link
                            href={`/productos/${product.id}`}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-off-white dark:bg-white/10 text-charcoal dark:text-off-white text-sm font-semibold leading-normal hover:bg-charcoal/10 dark:hover:bg-white/20 transition-colors"
                          >
                            <span className="truncate">Añadir al carrito</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Categorías */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="font-display text-charcoal dark:text-off-white text-4xl font-bold leading-tight px-4 pb-6">
                Explorar por Categoría
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
                <Link
                  className="group relative flex flex-col justify-end items-center text-center p-4 rounded-xl h-48 md:h-64 overflow-hidden"
                  href="#"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC85F3j-wBqGl8zEOQb33CkSWwVnhP24iUxfVn1etMpC5TMDJnadwsH_LABEBu_WOK7YxqoghxWyAFKtrJtaLag_7rJxIlnrcP4gI4QKawwowGu_P6a1tQLKTF53kmb1u3CA8X3Gv4etAV0S2OeZKWIA21ui5QiAM5cRIuqne16y60PvV2SzdVe05YS8do4e-R_R4SKQi2Qsr4jWoMR8gzd1uF9eZP15LhA_9cLkbaFGnsKhWwLufWpNUfl1ILdJygk70eJG9x6DVLf')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="relative text-white text-lg font-semibold">Salón</h3>
                </Link>
                <Link
                  className="group relative flex flex-col justify-end items-center text-center p-4 rounded-xl h-48 md:h-64 overflow-hidden"
                  href="#"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDw5KP8JiHPNHAiorQHQIMqL8S1gPScOWSglnXw25ne2emYW52xuFlm0BxCr1niVZmFNw9dza4wKYuKX9ulMUZFAXrVSr7uzdKW64CpURmYbko6awXQzxArTbVhgFtkNHy1vUjLZMgRL_511Fhsbfgk1wUKVSo0GK1l1o9ezp3TfWT66Ib0UBQB7F4ygMREzhP_kApkjDcJPvmlyr3OnzWVUxaKSBo7ZyD9-8fhqdR7VZQ6H0zl7suQjFgCzGv0dSiSOH6Fjjl0aJvi')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="relative text-white text-lg font-semibold">Dormitorio</h3>
                </Link>
                <Link
                  className="group relative flex flex-col justify-end items-center text-center p-4 rounded-xl h-48 md:h-64 overflow-hidden"
                  href="#"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNqGVN7kyR_ve1YK5tbxjMYPHnYTOoLPEMk_40Rhq2Y_exxratPjw9H9oA2YyLF4fDXf6wlPnJ-_k-JYE2O_8dk2KlToV_VslIVXCCJjDAlUh79lTrRkR0rmrulzI2go_AZucSWwsvZmQs1S-AdbNy29JeDrl6zhQHvAsDQ37l-5IPZOm6y9tnoOzpAJo7-l9WOpyFSEZT2ODTk7TJopWst6R1SvvqII9zA6NUY_KmutVoBotp8mDMjAZPACKM4DdbGR5GipADdN2Y')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="relative text-white text-lg font-semibold">Comedor</h3>
                </Link>
                <Link
                  className="group relative flex flex-col justify-end items-center text-center p-4 rounded-xl h-48 md:h-64 overflow-hidden"
                  href="#"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsKlILtlmsy35ZBn_IWi5jZkju309lESqQR6TI5AqFgDxGv5wQ_RJGpDjgWhZ3pGsSctYt8UAzqqFB2s_zkBby7dK8JJMLaBvko967koQ7Kw6Y5_Zj9GsHGuTFDb8mtP-gk4CXnXRDkGzal-4jxhGoAvQIo2gxT2DOwV6zfAfpDPv-wB19jBf3_xowcLuhlQ6B0N2QTIOnWN2hGP-EFBmEE2kfISPdjveaWk_dGtzrZ-wOhg2m05W9ghm5IrHm5rivIGtsSJyz140F')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="relative text-white text-lg font-semibold">Oficina</h3>
                </Link>
              </div>
            </div>
          </section>

          {/* Características */}
          <section className="w-full bg-white dark:bg-background-dark py-8 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-primary">local_shipping</span>
                  <h4 className="font-semibold text-lg">Envío Gratuito</h4>
                  <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                    En todos los pedidos superiores a 500 €
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-primary">eco</span>
                  <h4 className="font-semibold text-lg">Materiales Sostenibles</h4>
                  <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                    Fabricado pensando en el planeta
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-primary">construction</span>
                  <h4 className="font-semibold text-lg">Calidad Artesanal</h4>
                  <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                    Construido para durar toda la vida
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}