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

export default function TrackOrderPage() {
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  // Función para obtener el color del estado
  function getStatusColor(status: string): string {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const fetchOrder = async () => {
    if (!orderId.trim()) {
      setError('Por favor ingresa un número de pedido')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Verificar si el usuario está autenticado para permitir acceso a sus pedidos
      const currentUser = await getCurrentUser()
      
      // Buscar el pedido en la base de datos
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !orderData) {
        setError('Pedido no encontrado')
        setOrder(null)
        setLoading(false)
        return
      }

      // Verificar si el pedido pertenece al usuario actual (si está autenticado)
      if (currentUser && orderData.user_id !== currentUser.id) {
        setError('No tienes permiso para ver este pedido')
        setOrder(null)
        setLoading(false)
        return
      }

      // Obtener los items del pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products (name, image_url)
        `)
        .eq('order_id', orderId)

      if (itemsError) {
        console.error('Error fetching order items:', itemsError)
        setOrder({ ...orderData, items: [] })
      } else {
        // Mapear los items para tener la información del producto
        const itemsWithProductInfo = itemsData.map((item: any) => ({
          ...item,
          product_name: item.products?.name || 'Producto no disponible',
          product_image: item.products?.image_url || null
        }))

        setOrder({ ...orderData, items: itemsWithProductInfo })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Error al buscar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal dark:text-off-white">
            Seguimiento de Pedido
          </h1>
          <p className="text-charcoal/70 dark:text-off-white/70 mt-2">
            Ingresa el número de tu pedido para ver su estado
          </p>
        </div>

        <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Número de pedido"
              className="flex-1 px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Pedido'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div>
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden mb-8">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
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

              {/* Visualización del estado del pedido */}
              <div className="p-6 border-b border-charcoal/10 dark:border-off-white/10">
                <div className="flex justify-between relative">
                  {/* Línea de progreso */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-charcoal/20 dark:bg-off-white/20 -z-10"></div>
                  
                  {/* Estados del pedido */}
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status)
                    const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(status) <= statusOrder
                    const isActive = status === order.status
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary text-white' : 
                          isActive ? 'bg-charcoal text-white dark:bg-off-white' : 
                          'bg-charcoal/10 text-charcoal/50 dark:bg-off-white/10 dark:text-off-white/50'
                        }`}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-sm">check</span>
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          isActive ? 'font-medium text-primary' : 
                          isCompleted ? 'text-charcoal dark:text-off-white' : 
                          'text-charcoal/50 dark:text-off-white/50'
                        }`}>
                          {getOrderStatus(status)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-medium text-charcoal dark:text-off-white mb-4">Productos</h4>
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

            {/* Información de contacto de soporte */}
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
              <h4 className="font-medium text-charcoal dark:text-off-white mb-2">¿Necesitas ayuda con tu pedido?</h4>
              <p className="text-charcoal/70 dark:text-off-white/70 text-sm mb-4">
                Si tienes alguna pregunta sobre tu pedido, contáctanos y nuestro equipo te ayudará.
              </p>
              <a 
                href="mailto:soporte@furni.com"
                className="inline-flex items-center text-primary hover:underline text-sm"
              >
                <span className="material-symbols-outlined mr-1 text-sm">email</span>
                soporte@furni.com
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}