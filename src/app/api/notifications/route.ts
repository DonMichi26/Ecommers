import { NextRequest } from 'next/server'
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendWelcomeEmail } from '@/lib/email/sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'order_confirmation':
        await sendOrderConfirmationEmail(data.email, data.order)
        return new Response(JSON.stringify({ message: 'Email de confirmación enviado' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      case 'order_status_update':
        await sendOrderStatusUpdateEmail(data.email, data.order)
        return new Response(JSON.stringify({ message: 'Email de actualización de estado enviado' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      case 'welcome':
        await sendWelcomeEmail(data.email, data.name)
        return new Response(JSON.stringify({ message: 'Email de bienvenida enviado' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Tipo de notificación no válido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Error al enviar notificación por email:', error)
    return new Response(JSON.stringify({ error: 'Error al enviar notificación por email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}