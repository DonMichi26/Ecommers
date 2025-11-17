'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/server'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  category_id: string | null
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
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
    if (isAdmin && params.id) {
      fetchProduct()
      fetchCategories()
    }
  }, [isAdmin, params.id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        // Convertir el precio de céntimos a euros para el formulario
        setFormData({
          ...data,
          price: data.price / 100  // Convertir de céntimos a euros
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error al cargar el producto')
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev!,
      [name]: value
    }) as Product)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSubmitting(true)

    try {
      // Convertir el precio a céntimos
      const productData = {
        ...formData,
        price: formData.price * 100  // Convertir a céntimos
      }

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      alert('Producto actualizado exitosamente')
      router.push('/admin/productos')
      router.refresh()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error al actualizar el producto')
    } finally {
      setSubmitting(false)
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

  if (!formData) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <p className="text-charcoal dark:text-off-white">Producto no encontrado</p>
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
            href="/admin/productos"
            className="text-sm text-primary hover:underline"
          >
            Volver a productos
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-off-white">
            Editar Producto
          </h2>
          <p className="text-charcoal/70 dark:text-off-white/70 mt-1">
            Actualiza la información del producto
          </p>
        </div>

        <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                Nombre del producto
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                placeholder="Descripción del producto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                  Precio (€)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Cantidad en stock"
                />
              </div>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                URL de la imagen
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-charcoal dark:text-off-white mb-1">
                Categoría
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-charcoal/20 dark:border-off-white/20 rounded-lg bg-white dark:bg-background-dark text-charcoal dark:text-off-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <a
                href="/admin/productos"
                className="px-6 py-2.5 border border-charcoal/20 dark:border-off-white/20 text-charcoal dark:text-off-white font-medium rounded-lg hover:bg-charcoal/5 dark:hover:bg-off-white/5 transition-colors"
              >
                Cancelar
              </a>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Actualizar Producto'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}