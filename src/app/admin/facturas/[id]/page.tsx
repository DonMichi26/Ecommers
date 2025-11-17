'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'
import InvoiceGenerator from '@/components/InvoiceGenerator'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product_name?: string
}

interface Order {
  id: string
  user_id: string
  status: string
  total: number
  created_at: string
  user_email?: string
  items: OrderItem[]
}

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
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
    if (isAdmin && params.id) {
      fetchOrder()
    }
  }, [isAdmin, params.id])

  const fetchOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          users:profiles!user_id (email)
        `)
        .eq('id', params.id)
        .single()

      if (orderError) {
        throw orderError
      }

      if (!orderData) {
        router.push('/admin/pedidos')
        return
      }

      // Obtener los items del pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products (name)
        `)
        .eq('order_id', params.id)

      if (itemsError) {
        throw itemsError
      }

      // Mapear los items para tener la información del producto
      const itemsWithProductInfo = itemsData.map((item: any) => ({
        ...item,
        product_name: item.products?.name || 'Producto no disponible'
      }))

      setOrder({ 
        ...orderData, 
        items: itemsWithProductInfo,
        user_email: orderData.users?.email || 'Usuario eliminado'
      })
    } catch (error) {
      console.error('Error fetching order:', error)
      alert('Error al cargar el pedido')
      router.push('/admin/pedidos')
    } finally {
      setLoading(false)
    }
  }

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

  if (!order) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <p className="text-charcoal dark:text-off-white">Pedido no encontrado</p>
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
            href="/admin/pedidos"
            className="text-sm text-primary hover:underline"
          >
            Volver a pedidos
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-off-white">
              Factura del Pedido #{order.id.substring(0, 8).toUpperCase()}
            </h2>
            <p className="text-charcoal/70 dark:text-off-white/70 mt-1">
              Cliente: {order.user_email}
            </p>
          </div>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2 text-sm">picture_as_pdf</span>
            Generar Factura PDF
          </button>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-charcoal dark:text-off-white mb-2">Información del pedido</h3>
              <p className="text-sm text-charcoal/70 dark:text-off-white/70">ID: {order.id}</p>
              <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                Fecha: {new Date(order.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-charcoal dark:text-off-white mb-2">Cliente</h3>
              <p className="text-sm text-charcoal/70 dark:text-off-white/70">{order.user_email}</p>
            </div>
            <div>
              <h3 className="font-medium text-charcoal dark:text-off-white mb-2">Total</h3>
              <p className="text-lg font-bold text-charcoal dark:text-off-white">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="border-t border-charcoal/10 dark:border-off-white/10 pt-6">
            <h3 className="font-medium text-charcoal dark:text-off-white mb-4">Items del pedido</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-charcoal/10 dark:border-off-white/10 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-charcoal/10 dark:bg-charcoal/20 rounded-md flex items-center justify-center mr-4">
                      <span className="material-symbols-outlined text-charcoal/30 dark:text-off-white/30">
                        chair
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal dark:text-off-white">{item.product_name}</p>
                      <p className="text-sm text-charcoal/70 dark:text-off-white/70">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-charcoal dark:text-off-white">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                    <p className="text-sm text-charcoal/70 dark:text-off-white/70">
                      ({formatPrice(item.unit_price)} c/u)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón para generar factura */}
        <div className="text-center">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2 text-sm">picture_as_pdf</span>
            Generar Factura PDF
          </button>
        </div>
      </main>

      {/* Modal para generar factura */}
      {showInvoiceModal && order && (
        <InvoiceGenerator 
          order={order} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </div>
  )
}