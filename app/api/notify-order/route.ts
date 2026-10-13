import { NextResponse } from 'next/server';
import { notifyNewOrder, targetFor } from '../../../lib/notificationService';
import { publicCtx } from '@/lib/tenant';
import { whatsappNewOrder } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();

    const { reference, customerName, customerPhone, customerEmail, address, city, items, total, serviceType, notes, transactionId } = body;

    if (!reference || !items || !total) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 });
    }

    await notifyNewOrder({
      reference,
      customerName: customerName || 'Cliente',
      customerPhone: customerPhone || 'No especificado',
      customerEmail,
      address,
      city,
      items,
      total,
      serviceType,
      notes,
      transactionId,
    }, targetFor(ctx.tenant));

    // Aviso por WhatsApp al restaurante (si lo activó). Se envía una vez por referencia aunque
    // también llegue por el webhook de ePayco.
    await whatsappNewOrder(ctx.tenant, {
      reference,
      customerName: customerName || 'Cliente',
      total: Number(total) || 0,
      serviceType,
    }).catch((error) => console.error('[WHATSAPP] aviso de pedido:', error));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending order notification:', error);
    return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}
