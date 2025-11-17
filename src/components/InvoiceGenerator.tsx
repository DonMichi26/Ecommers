'use client'

import { jsPDF } from 'jspdf'
import { useState } from 'react'
import html2canvas from 'html2canvas'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  user_email: string
  created_at: string
  total: number
  items: OrderItem[]
}

interface InvoiceProps {
  order: Order
  onClose: () => void
}

export default function InvoiceGenerator({ order, onClose }: InvoiceProps) {
  const [loading, setLoading] = useState(false)

  const formatPrice = (priceInCents: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInCents / 100)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generatePDF = async () => {
    setLoading(true)
    try {
      const element = document.getElementById('invoice-content')
      if (!element) {
        console.error('Invoice content element not found')
        return
      }

      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if content is larger than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`factura-${order.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar la factura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-charcoal dark:text-off-white">Factura</h2>
            <button 
              onClick={onClose}
              className="text-charcoal/70 dark:text-off-white/70 hover:text-charcoal dark:hover:text-off-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div id="invoice-content" className="p-8 bg-white">
            {/* Encabezado de la factura */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-primary">FURNI.</h1>
                  <p className="text-charcoal/70 dark:text-off-white/70 mt-2">Muebles atemporales, entregados en tu puerta.</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-charcoal dark:text-off-white">Factura</h2>
                  <p className="text-charcoal/70 dark:text-off-white/70">#{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <div>
                  <h3 className="font-semibold text-charcoal dark:text-off-white">Facturado a:</h3>
                  <p className="text-charcoal dark:text-off-white">{order.user_email}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-charcoal dark:text-off-white">Fecha:</h3>
                  <p className="text-charcoal dark:text-off-white">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Detalles del pedido */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal/20 dark:border-off-white/20">
                    <th className="text-left pb-2 text-charcoal/70 dark:text-off-white/70">Producto</th>
                    <th className="text-right pb-2 text-charcoal/70 dark:text-off-white/70">Cantidad</th>
                    <th className="text-right pb-2 text-charcoal/70 dark:text-off-white/70">Precio unitario</th>
                    <th className="text-right pb-2 text-charcoal/70 dark:text-off-white/70">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id} className={`${index !== order.items.length - 1 ? 'border-b border-charcoal/10 dark:border-off-white/10' : ''}`}>
                      <td className="py-3 text-charcoal dark:text-off-white">{item.product_name}</td>
                      <td className="py-3 text-right text-charcoal dark:text-off-white">{item.quantity}</td>
                      <td className="py-3 text-right text-charcoal dark:text-off-white">{formatPrice(item.unit_price)}</td>
                      <td className="py-3 text-right text-charcoal dark:text-off-white">{formatPrice(item.unit_price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-charcoal dark:text-off-white">Subtotal:</span>
                  <span className="text-charcoal dark:text-off-white">{formatPrice(order.total - 500)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-charcoal dark:text-off-white">Envío:</span>
                  <span className="text-charcoal dark:text-off-white">5.00 €</span>
                </div>
                <div className="flex justify-between py-2 border-t border-charcoal/20 dark:border-off-white/20 font-semibold">
                  <span className="text-charcoal dark:text-off-white">Total:</span>
                  <span className="text-charcoal dark:text-off-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-12 pt-6 border-t border-charcoal/20 dark:border-off-white/20 text-center text-sm text-charcoal/70 dark:text-off-white/70">
              <p>Gracias por tu compra</p>
              <p className="mt-2">Si tienes alguna pregunta sobre esta factura, contáctanos en contacto@furni.com</p>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-charcoal/20 dark:border-off-white/20 text-charcoal dark:text-off-white font-medium rounded-lg hover:bg-charcoal/5 dark:hover:bg-off-white/5 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={generatePDF}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}