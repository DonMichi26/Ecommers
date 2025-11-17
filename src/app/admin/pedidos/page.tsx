'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'

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
  updated_at: string
  user_email?: string
  items: OrderItem[]
}

export default function AdminOrdersPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
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
      month: 'short',
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
      fetchOrders()
    }
  }, [isAdmin, selectedStatus])

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          users:profiles!user_id (email)
        `)
        .order('created_at', { ascending: false })

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Para cada pedido, obtener los items
      const ordersWithItems = await Promise.all(
        (data || []).map(async (order: any) => {
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

          return { 
            ...order, 
            items: itemsWithProductInfo,
            user_email: order.users?.email || 'Usuario eliminado'
          }
        })
      )

      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Primero obtener el pedido actual para tener la información del usuario
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          users:profiles!user_id (email)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) {
        throw orderError
      }

      // Actualizar el estado del pedido
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (updateError) {
        throw updateError
      }

      // Actualizar el estado en la interfaz
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // Enviar notificación por email al usuario
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'order_status_update',
            data: {
              email: orderData.users?.email || orderData.user_email,
              order: { ...orderData, status: newStatus, updated_at: new Date().toISOString() }
            }
          })
        })
      } catch (emailError) {
        console.error('Error al enviar email de actualización de estado:', emailError)
        // No lanzamos error porque la actualización del pedido fue exitosa
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado del pedido')
    }
  }

  // Filtrar pedidos según el estado seleccionado
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

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

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ]

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
              Gestión de Pedidos
            </h2>
            <p className="text-charcoal/70 dark:text-off-white/70 mt-1">
              Administra los pedidos de tus clientes
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="status-filter" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
              Filtrar por estado
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/70 dark:text-off-white/70 mb-6">
              No se encontraron pedidos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-charcoal/10 dark:border-off-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-medium text-charcoal dark:text-off-white">
                        Pedido #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-charcoal/70 dark:text-off-white/70 mt-1">
                        Cliente: {order.user_email}
                      </p>
                      <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                        {formatDate(order.created_at)} • {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                              : order.status === 'shipped' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                                : order.status === 'processing' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' 
                                  : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-charcoal dark:text-off-white">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <a 
                        href={`/admin/facturas/${order.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Ver factura
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
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
    </div>
  )
}