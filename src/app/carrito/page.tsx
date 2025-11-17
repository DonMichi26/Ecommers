"use client";

import { useState, useEffect } from 'react';
import { Product } from '@/types/supabase';
import { supabase } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Cargar ítems del carrito ---
  useEffect(() => {
    // En una implementación real, esto se obtendría de Supabase o del localStorage
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // --- Actualizar cantidad de un producto en el carrito ---
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // --- Eliminar un producto del carrito ---
  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // --- Calcular el total ---
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal dark:text-off-white">
            Tu Carrito de Compras
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/70 dark:text-off-white/70 mb-6">
              Tu carrito está vacío
            </p>
            <Link 
              href="/catalogo"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 overflow-hidden">
                <ul className="divide-y divide-charcoal/10 dark:divide-off-white/10">
                  {cartItems.map((item) => (
                    <li key={item.product.id} className="p-6">
                      <div className="flex items-center">
                        <div className="relative h-24 w-24 flex-shrink-0 mr-6">
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-charcoal/10 dark:bg-charcoal/20 rounded-lg">
                              <span className="material-symbols-outlined text-4xl text-charcoal/30 dark:text-off-white/30">
                                image
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-charcoal dark:text-off-white">
                            {item.product.name}
                          </h3>
                          <p className="text-primary font-semibold mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                          
                          <div className="flex items-center mt-4">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/20 dark:border-off-white/20 rounded-l-md text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5"
                            >
                              -
                            </button>
                            <span className="w-12 h-8 flex items-center justify-center border-y border-charcoal/20 dark:border-off-white/20 text-charcoal dark:text-off-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/20 dark:border-off-white/20 rounded-r-md text-charcoal dark:text-off-white hover:bg-charcoal/5 dark:hover:bg-off-white/5"
                            >
                              +
                            </button>
                            
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="ml-4 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <p className="font-medium text-charcoal dark:text-off-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-charcoal/10 dark:border-off-white/10 p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-charcoal dark:text-off-white mb-4">
                  Resumen del Pedido
                </h2>
                
                <div className="flex justify-between mb-2">
                  <span className="text-charcoal dark:text-off-white">Subtotal</span>
                  <span className="text-charcoal dark:text-off-white">{formatPrice(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-charcoal dark:text-off-white">Envío</span>
                  <span className="text-charcoal dark:text-off-white">
                    {cartTotal > 50000 ? 'Gratis' : '5.00 €'}
                  </span>
                </div>
                
                <div className="flex justify-between mb-6 pt-4 border-t border-charcoal/10 dark:border-off-white/10">
                  <span className="text-charcoal dark:text-off-white font-semibold">Total</span>
                  <span className="text-charcoal dark:text-off-white font-semibold">
                    {formatPrice(cartTotal > 50000 ? cartTotal : cartTotal + 500)}
                  </span>
                </div>
                
                <button className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Proceder al Pago
                </button>
                
                <Link 
                  href="/catalogo"
                  className="block text-center mt-4 text-primary hover:underline"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}