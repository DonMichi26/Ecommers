"use client";

import { useState, useEffect } from 'react';
import { Product } from '@/types/supabase';
import { supabase } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

// --- Tipos para el carrito ---
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// --- Función para formatear precios ---
function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100);
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // --- Cargar producto ---
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        notFound();
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  // --- Agregar al carrito ---
  const addToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      id: product.id,
      product,
      quantity
    };

    // Obtener carrito actual del localStorage
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Añadir nuevo producto al carrito
      cart.push(cartItem);
    }

    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar notificación de éxito
    alert(`${product.name} ha sido añadido al carrito`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link
            href="/catalogo"
            className="text-primary hover:underline flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver al catálogo
          </Link>
        </div>

        {product && (
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="relative aspect-square bg-charcoal/5 dark:bg-charcoal/10 rounded-lg overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-8xl text-charcoal/20 dark:text-off-white/20">
                      image
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h1 className="font-display text-3xl font-bold text-charcoal dark:text-off-white mb-4">
                  {product.name}
                </h1>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-charcoal dark:text-off-white">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-charcoal dark:text-off-white mb-2">
                      Descripción
                    </h2>
                    <p className="text-charcoal/80 dark:text-off-white/80 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    {product.stock > 0 ? (
                      <span className="text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded font-medium">
                        En stock ({product.stock} disponibles)
                      </span>
                    ) : (
                      <span className="text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded font-medium">
                        Agotado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-off-white mb-2">
                        Cantidad
                      </label>
                      <div className="flex items-center border border-charcoal/20 dark:border-off-white/20 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="px-4 py-2 text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-charcoal dark:text-off-white min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="px-4 py-2 text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-charcoal/10 dark:border-off-white/10">
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:bg-charcoal/20 disabled:text-charcoal/50 disabled:cursor-not-allowed"
                  >
                    {product.stock > 0 ? 'Añadir al carrito' : 'Producto agotado'}
                  </button>
                  
                  <div className="flex gap-4 mt-4">
                    <button className="flex-1 border border-charcoal/20 dark:border-off-white/20 text-charcoal dark:text-off-white py-3 px-6 rounded-lg font-medium hover:bg-charcoal/5 dark:hover:bg-off-white/5 transition-colors">
                      Comprar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}