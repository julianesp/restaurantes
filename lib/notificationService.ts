/**
 * Servicio de notificaciones vía Telegram
 * Notifica al chef y administrador sobre nuevos pedidos, reservas y errores
 */

const log = (...args: unknown[]) => console.log('[NOTIF]', ...args);
const logError = (...args: unknown[]) => console.error('[NOTIF ERROR]', ...args);

/** A quién se notifica: cada restaurante tiene su propio chat de Telegram. */
export interface NotifyTarget {
  restaurantName: string;
  chatId: string | null;
}

/**
 * Destino de las notificaciones de un restaurante: el chat de Telegram que configuró en su panel.
 * El restaurante original conserva TELEGRAM_CHAT_ID como respaldo. Sin chat configurado no se notifica.
 */
export function targetFor(tenant: { name: string; plan: string; settings: Record<string, unknown> }): NotifyTarget {
  const configured = typeof tenant.settings?.telegram_chat_id === 'string' ? tenant.settings.telegram_chat_id.trim() : '';
  const chatId = configured || (tenant.plan === 'legacy' ? process.env.TELEGRAM_CHAT_ID || '' : '');
  return { restaurantName: tenant.name, chatId: chatId || null };
}

// Un solo bot de la plataforma (TELEGRAM_BOT_TOKEN); cada restaurante lo agrega a su chat.
async function sendTelegramMessage(message: string, target: NotifyTarget): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || !target.chatId) {
    log('⚠️ Telegram no configurado para este restaurante. Omitiendo notificación.');
    return false;
  }

  const text = `🏪 <b>${escapeHtml(target.restaurantName)}</b>\n${message}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: target.chatId, text, parse_mode: 'HTML' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      logError('Error al enviar a Telegram:', errorData);
      return false;
    }

    log('✅ Notificación enviada a Telegram exitosamente');
    return true;
  } catch (error) {
    logError('Error al conectar con Telegram:', error);
    return false;
  }
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface OrderNotificationData {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  city?: string;
  items: Array<{ name: string; quantity: number; price?: string }>;
  total: number;
  notes?: string;
  serviceType?: string; // 'domicilio' | 'recoger'
  transactionId?: string;
}

export interface ReservationNotificationData {
  reference: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  people: string;
  comments?: string;
  transactionId?: string;
}

/**
 * Notifica al chef y administrador sobre un nuevo pedido aprobado
 */
export async function notifyNewOrder(orderData: OrderNotificationData, target: NotifyTarget): Promise<boolean> {
  try {
    log('🍽️ Enviando notificación de nuevo pedido...');

    const fecha = new Date().toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const itemsText = orderData.items
      .map((item, idx) => `  ${idx + 1}. ${item.name} x${item.quantity}`)
      .join('\n');

    const totalFormateado = orderData.total.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    });

    const tipoServicio = orderData.serviceType === 'recoger'
      ? '🏃 Para recoger en local'
      : '🛵 Domicilio';

    const direccionInfo = orderData.serviceType !== 'recoger' && orderData.address
      ? `\n📍 <b>Dirección:</b> ${orderData.address}${orderData.city ? `, ${orderData.city}` : ''}`
      : '';

    const notasInfo = orderData.notes
      ? `\n📝 <b>Notas:</b> ${orderData.notes}`
      : '';

    const mensaje = `
🍽️ <b>¡NUEVO PEDIDO!</b> 🍽️

📋 <b>Ref:</b> #${orderData.reference}
${tipoServicio}${direccionInfo}

👤 <b>Cliente:</b>
   ${orderData.customerName}
   📱 ${orderData.customerPhone}${orderData.customerEmail ? `\n   📧 ${orderData.customerEmail}` : ''}

🛒 <b>Platos a preparar:</b>
${itemsText}

💰 <b>Total:</b> ${totalFormateado}
✅ <b>Pago:</b> APROBADO${notasInfo}

🕐 <b>Hora:</b> ${fecha}
    `.trim();

    return await sendTelegramMessage(mensaje, target);
  } catch (error) {
    logError('Error en notifyNewOrder:', error);
    return false;
  }
}

/**
 * Notifica sobre una nueva reserva aprobada
 */
export async function notifyNewReservation(reservationData: ReservationNotificationData, target: NotifyTarget): Promise<boolean> {
  try {
    log('📅 Enviando notificación de nueva reserva...');

    const fecha = new Date().toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const comentariosInfo = reservationData.comments
      ? `\n📝 <b>Comentarios:</b> ${reservationData.comments}`
      : '';

    const mensaje = `
📅 <b>¡NUEVA RESERVA!</b>

📋 <b>Ref:</b> #${reservationData.reference}

👤 <b>Cliente:</b>
   ${reservationData.customerName}
   📱 ${reservationData.customerPhone}

🗓️ <b>Fecha:</b> ${reservationData.date}
🕐 <b>Hora:</b> ${reservationData.time}
👥 <b>Personas:</b> ${reservationData.people}${comentariosInfo}

✅ <b>Pago anticipo:</b> APROBADO

⏰ <b>Registrado:</b> ${fecha}
    `.trim();

    return await sendTelegramMessage(mensaje, target);
  } catch (error) {
    logError('Error en notifyNewReservation:', error);
    return false;
  }
}

/**
 * Notifica un error crítico en el proceso de pago
 */
export async function notifyPaymentError(errorMessage: string, context: Record<string, unknown>, target: NotifyTarget): Promise<boolean> {
  try {
    const mensaje = `
⚠️ <b>ERROR EN PAGO</b>

🚨 <b>Error:</b> ${errorMessage}
📋 <b>Referencia:</b> ${(context.reference as string) || 'N/A'}
🕐 ${new Date().toLocaleString('es-CO')}
    `.trim();

    return await sendTelegramMessage(mensaje, target);
  } catch (error) {
    logError('Error en notifyPaymentError:', error);
    return false;
  }
}

/**
 * Envía una notificación de prueba para verificar la configuración
 */
export async function sendTestNotification(target: NotifyTarget): Promise<{ success: boolean; error?: string }> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'El bot de Telegram de la plataforma no está configurado' };
  }
  if (!target.chatId) {
    return { success: false, error: 'Aún no has configurado el ID de tu chat de Telegram' };
  }

  const mensaje = `
🔔 <b>Prueba de Notificaciones</b>

✅ El bot de Telegram está configurado correctamente.

Tu equipo recibirá notificaciones automáticas cuando:
🍽️ Se confirme un nuevo pedido
📅 Se registre una nueva reserva
⚠️ Haya un error en un pago

🕐 ${new Date().toLocaleString('es-CO')}
  `.trim();

  const ok = await sendTelegramMessage(mensaje, target);

  return ok
    ? { success: true }
    : { success: false, error: 'No se pudo enviar el mensaje. Verifica el token y el chat ID.' };
}
