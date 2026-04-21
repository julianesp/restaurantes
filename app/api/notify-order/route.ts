import { NextResponse } from 'next/server';
import { notifyNewOrder } from '../../../lib/notificationService';

export async function POST(request: Request) {
  try {
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending order notification:', error);
    return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}
