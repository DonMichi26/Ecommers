'use client'

import { useState } from 'react'
import { signIn } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

interface SignInFormProps {
  onSwitchToSignup: () => void
}

export default function SignInForm({ onSwitchToSignup }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push('/perfil')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-8">
        <h1 className="font-display text-2xl font-bold text-charcoal dark:text-off-white mb-6 text-center">
          Iniciar Sesión
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-charcoal/70 dark:text-off-white/70">
          <p>
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary font-medium hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}