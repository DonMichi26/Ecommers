'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product_name?: string
  product_image?: string
}

interface Order {
  id: string
  user_id: string
  status: string
  total: number
  created_at: string
  items: OrderItem[]
}

export default function OrderHistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Función para formatear precios
  function formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInCents / 100)
  }

  // Función para formatear fecha
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Función para obtener el estado del pedido en español
  function getOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }
    return statusMap[status] || status
  }

  const fetchUserAndOrders = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth')
        return
      }

      setUser(currentUser)

      // Obtener los pedidos del usuario
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (ordersError) {
        throw ordersError
      }

      // Para cada pedido, obtener los items
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order: any) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products (name, image_url)
            `)
            .eq('order_id', order.id)

          if (itemsError) {
            console.error('Error fetching order items:', itemsError)
            return { ...order, items: [] }
          }

          // Mapear los items para tener la información del producto
          const itemsWithProductInfo = itemsData.map((item: any) => ({
            ...item,
            product_name: item.products?.name || 'Producto no disponible',
            product_image: item.products?.image_url || null
          }))

          return { ...order, items: itemsWithProductInfo }
        })
      )

      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching user or orders:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAndOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal dark:text-off-white">
            Historial de Pedidos
          </h1>
          <p className="text-charcoal/70 dark:text-off-white/70 mt-2">
            Revisa el estado de tus pedidos anteriores
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/70 dark:text-off-white/70 mb-6">
              Aún no has realizado ningún pedido
            </p>
            <a 
              href="/catalogo"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver catálogo
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden"
              >
                <div className="p-6 border-b border-charcoal/10 dark:border-off-white/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-medium text-charcoal dark:text-off-white">
                        Pedido #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-charcoal/70 dark:text-off-white/70 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : order.status === 'shipped' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                            : order.status === 'processing' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {getOrderStatus(order.status)}
                      </span>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="font-semibold text-charcoal dark:text-off-white">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="relative h-16 w-16 flex-shrink-0 mr-4">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-charcoal/10 dark:bg-charcoal/20 rounded-lg">
                              <span className="material-symbols-outlined text-xl text-charcoal/30 dark:text-off-white/30">
                                image
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal dark:text-off-white text-sm">
                            {item.product_name}
                          </h4>
                          <p className="text-charcoal/70 dark:text-off-white/70 text-sm mt-1">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <p className="font-medium text-charcoal dark:text-off-white text-sm">
                            {formatPrice(item.unit_price * item.quantity)}
                          </p>
                          <p className="text-charcoal/70 dark:text-off-white/70 text-xs mt-1">
                            ({formatPrice(item.unit_price)} c/u)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}