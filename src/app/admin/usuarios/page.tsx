'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  user_metadata: {
    name?: string
  }
  last_sign_in_at?: string
}

export default function AdminUsersPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      // Usamos el cliente admin de Supabase para acceder a todos los usuarios
      // En una implementación real, necesitarías usar una API route con el service role key
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        throw error
      }

      // Formatear los usuarios para que coincidan con nuestra interfaz
      const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
        user_metadata: user.user_metadata,
        last_sign_in_at: user.last_sign_in_at
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error al cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.user_metadata?.name && user.user_metadata.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-off-white">
            Gestión de Usuarios
          </h2>
          <p className="text-charcoal/70 dark:text-off-white/70 mt-1">
            Administra los usuarios registrados en la plataforma
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Lista de usuarios */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/70 dark:text-off-white/70 mb-6">
              No se encontraron usuarios
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden">
            <table className="min-w-full divide-y divide-charcoal/10 dark:divide-off-white/10">
              <thead className="bg-charcoal/5 dark:bg-off-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 dark:text-off-white/70 uppercase tracking-wider">
                    Último acceso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 dark:divide-off-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-charcoal/5 dark:hover:bg-off-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-lg">
                            person
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-charcoal dark:text-off-white">
                            {user.user_metadata?.name || 'Nombre no definido'}
                          </div>
                          <div className="text-sm text-charcoal/70 dark:text-off-white/70">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal dark:text-off-white">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-charcoal/70 dark:text-off-white/70">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : 'Nunca'}
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