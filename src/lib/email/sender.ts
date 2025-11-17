import nodemailer from 'nodemailer'

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Función para enviar email de confirmación de pedido
export async function sendOrderConfirmationEmail(email: string, order: any) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Confirmación de Pedido - Furni.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Furni.</h1>
          <h2 style="color: #333;">Confirmación de Pedido</h2>
          <p>Gracias por tu compra, tu pedido ha sido recibido correctamente.</p>
          
          <div style="background-color: #f5f5f3; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles del Pedido</h3>
            <p><strong>Número de Pedido:</strong> ${order.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-ES')}</p>
            <p><strong>Total:</strong> ${(order.total / 100).toFixed(2)} €</p>
          </div>
          
          <p>Puedes seguir el estado de tu pedido en cualquier momento visitando tu <a href="${process.env.NEXT_PUBLIC_BASE_URL}/historial-pedidos">historial de pedidos</a>.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>Este correo electrónico fue enviado automáticamente, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Furni. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Correo de confirmación de pedido enviado:', info.messageId)
    return info
  } catch (error) {
    console.error('Error al enviar el correo de confirmación de pedido:', error)
    throw error
  }
}

// Función para enviar email de cambio de estado de pedido
export async function sendOrderStatusUpdateEmail(email: string, order: any) {
  try {
    const statusText = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Actualización de Pedido #${order.id.substring(0, 8).toUpperCase()} - Furni.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Furni.</h1>
          <h2 style="color: #333;">Actualización de Pedido</h2>
          <p>El estado de tu pedido ha sido actualizado.</p>
          
          <div style="background-color: #f5f5f3; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles del Pedido</h3>
            <p><strong>Número de Pedido:</strong> ${order.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Nuevo Estado:</strong> ${statusText[order.status as keyof typeof statusText] || order.status}</p>
            <p><strong>Fecha:</strong> ${new Date(order.updated_at || order.created_at).toLocaleDateString('es-ES')}</p>
          </div>
          
          <p>Puedes seguir el estado de tu pedido en cualquier momento visitando tu <a href="${process.env.NEXT_PUBLIC_BASE_URL}/historial-pedidos">historial de pedidos</a>.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>Este correo electrónico fue enviado automáticamente, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Furni. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Correo de actualización de estado de pedido enviado:', info.messageId)
    return info
  } catch (error) {
    console.error('Error al enviar el correo de actualización de estado de pedido:', error)
    throw error
  }
}

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Bienvenido a Furni.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Furni.</h1>
          <h2 style="color: #333;">¡Bienvenido ${name || 'a Furni'}!</h2>
          <p>Gracias por unirte a nuestra comunidad. Estamos encantados de tenerte con nosotros.</p>
          
          <p>Explora nuestro catálogo de muebles atemporales y encuentra las piezas perfectas para tu hogar.</p>
          
          <p>En caso de tener alguna pregunta, nuestro equipo de soporte está listo para ayudarte.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>Este correo electrónico fue enviado automáticamente, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Furni. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Correo de bienvenida enviado:', info.messageId)
    return info
  } catch (error) {
    console.error('Error al enviar el correo de bienvenida:', error)
    throw error
  }
}