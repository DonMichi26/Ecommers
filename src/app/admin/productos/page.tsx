'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  category_id: string | null
  created_at: string
}

export default function AdminProductsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Función para formatear precios
  function formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInCents / 100)
  }

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }

        setUser(currentUser)
        setIsAdmin(currentUser.email?.endsWith('@admin.com') || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/auth')
      } 
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      fetchProducts()
    }
  }, [isAdmin])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Actualizar la lista de productos
      setProducts(products.filter(product => product.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto')
    }
  }

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-charcoal dark:text-off-white mb-4">Acceso denegado</h1>
          <p className="text-charcoal/70 dark:text-off-white/70 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header del panel de administración */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-background-dark border-b border-charcoal/10 dark:border-off-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <h1 className="font-display text-xl font-bold text-charcoal dark:text-off-white">Panel de Administración</h1>
          </div>
          <a 
            href="/admin"
            className="text-sm text-primary hover:underline"
          >
            Volver al panel
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-off-white">
              Gestión de Productos
            </h2>
            <p className="text-charcoal/70 dark:text-off-white/70 mt-1">
              Administra los productos de tu catálogo
            </p>
          </div>
          <a 
            href="/admin/productos/nuevo"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2 text-sm">add</span>
            Nuevo Producto
          </a>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Lista de productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/70 dark:text-off-white/70 mb-6">
              No se encontraron productos
            </p>
            <a 
              href="/admin/productos/nuevo"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Agregar primer producto
            </a>
          </div>
        ) : (
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden">
            <table className="min-w-full divide-y divide-charcoal/10 dark:divide-off-white/10">
              <thead className="bg-charcoal/5 dark:bg-off-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 dark:divide-off-white/10">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-charcoal/5 dark:hover:bg-off-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-charcoal/10 dark:bg-off-white/10 rounded-md flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-charcoal/30 dark:text-off-white/30 text-xl">
                              image
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-charcoal dark:text-off-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-charcoal/70 dark:text-off-white/70 truncate max-w-xs">
                            {product.description || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal dark:text-off-white">
                        {formatPrice(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal dark:text-off-white">
                        {product.stock} {product.stock === 0 ? '(Agotado)' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal/70 dark:text-off-white/70">
                      {new Date(product.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a 
                          href={`/admin/productos/editar/${product.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 dark:hover:text-red-400 ml-4"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}