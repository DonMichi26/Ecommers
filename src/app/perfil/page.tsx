'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, getUserProfile, updateUserProfile, signOut } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const router = useRouter()

  const fetchUserAndProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth')
        return
      }

      setUser(currentUser)
      
      // Intentamos obtener el perfil del usuario
      try {
        const profileData = await getUserProfile(currentUser.id)
        setProfile(profileData)
      } catch (error) {
        // Si no existe el perfil, creamos un objeto vacío
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.name || '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
          created_at: currentUser.created_at
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    
    setUpdating(true)
    setUpdateSuccess(false)
    
    try {
      await updateUserProfile(user.id, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postal_code
      })
      setUpdateSuccess(true)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // El redirect ya se maneja en fetchUserAndProfile
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal dark:text-off-white">
            Perfil de Usuario
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
              <h2 className="font-display text-xl font-bold text-charcoal dark:text-off-white mb-6">
                Información Personal
              </h2>

              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  Perfil actualizado correctamente
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(profile ? {...profile, name: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-charcoal/5 dark:bg-off-white/5 text-charcoal/70 dark:text-off-white/70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      onChange={(e) => setProfile(profile ? {...profile, phone: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={profile?.city || ''}
                      onChange={(e) => setProfile(profile ? {...profile, city: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={profile?.address || ''}
                      onChange={(e) => setProfile(profile ? {...profile, address: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={profile?.postal_code || ''}
                      onChange={(e) => setProfile(profile ? {...profile, postal_code: e.target.value} : null)}
                      className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Actualizando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
              <h2 className="font-display text-xl font-bold text-charcoal dark:text-off-white mb-4">
                Cuenta
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-charcoal/70 dark:text-off-white/70">Miembro desde</p>
                  <p className="font-medium text-charcoal dark:text-off-white">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>

                <a
                  href="/historial-pedidos"
                  className="block py-3 text-charcoal dark:text-off-white hover:text-primary dark:hover:text-primary font-medium border-t border-charcoal/10 dark:border-off-white/10"
                >
                  Historial de Pedidos
                </a>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left py-3 text-red-600 hover:text-red-800 dark:hover:text-red-400 font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}