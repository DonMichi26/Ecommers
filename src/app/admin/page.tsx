'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }

        // Aquí puedes verificar si el usuario es administrador
        // Por ahora, verificamos si tiene un email específico o un rol en la base de datos
        // En una implementación real, esto debería verificarse contra una tabla de roles
        setUser(currentUser)
        
        // Por ahora, permitimos acceso si el usuario tiene un email terminado en @admin.com
        setIsAdmin(currentUser.email?.endsWith('@admin.com') || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

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
            No tienes permisos para acceder al panel de administración.
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
          <div>
            <span className="text-sm text-charcoal/70 dark:text-off-white/70">
              Bienvenido, {user?.user_metadata?.name || user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-off-white">
            Resumen del Negocio
          </h2>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <div>
                <p className="text-sm text-charcoal/70 dark:text-off-white/70">Pedidos Totales</p>
                <p className="text-2xl font-bold text-charcoal dark:text-off-white">142</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 mr-4">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p className="text-sm text-charcoal/70 dark:text-off-white/70">Ingresos</p>
                <p className="text-2xl font-bold text-charcoal dark:text-off-white">€24,580</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 mr-4">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="text-sm text-charcoal/70 dark:text-off-white/70">Clientes</p>
                <p className="text-2xl font-bold text-charcoal dark:text-off-white">89</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones del panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestión de productos */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-charcoal dark:text-off-white">Gestión de Productos</h3>
              <a 
                href="/admin/productos" 
                className="text-primary hover:underline text-sm"
              >
                Ver todos
              </a>
            </div>
            <p className="text-sm text-charcoal/70 dark:text-off-white/70 mb-4">
              Agrega, edita o elimina productos de tu catálogo
            </p>
            <a 
              href="/admin/productos/nuevo" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-1 text-sm">add</span>
              Nuevo Producto
            </a>
          </div>

          {/* Gestión de pedidos */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-charcoal dark:text-off-white">Gestión de Pedidos</h3>
              <a 
                href="/admin/pedidos" 
                className="text-primary hover:underline text-sm"
              >
                Ver todos
              </a>
            </div>
            <p className="text-sm text-charcoal/70 dark:text-off-white/70 mb-4">
              Revisa y actualiza el estado de los pedidos
            </p>
            <a 
              href="/admin/pedidos" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-1 text-sm">assignment</span>
              Ver Pedidos
            </a>
          </div>

          {/* Gestión de usuarios */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-charcoal dark:text-off-white">Gestión de Usuarios</h3>
              <a 
                href="/admin/usuarios" 
                className="text-primary hover:underline text-sm"
              >
                Ver todos
              </a>
            </div>
            <p className="text-sm text-charcoal/70 dark:text-off-white/70 mb-4">
              Administra los usuarios registrados en la plataforma
            </p>
            <a 
              href="/admin/usuarios" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-1 text-sm">people</span>
              Ver Usuarios
            </a>
          </div>

          {/* Reportes y estadísticas */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-charcoal dark:text-off-white">Reportes</h3>
              <a 
                href="/admin/reportes" 
                className="text-primary hover:underline text-sm"
              >
                Ver todos
              </a>
            </div>
            <p className="text-sm text-charcoal/70 dark:text-off-white/70 mb-4">
              Genera reportes sobre ventas y rendimiento
            </p>
            <a 
              href="/admin/reportes" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined mr-1 text-sm">analytics</span>
              Ver Reportes
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}