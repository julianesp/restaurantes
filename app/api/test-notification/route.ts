import { NextResponse } from 'next/server';
import { sendTestNotification, notifyNewOrder } from '../../../lib/notificationService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = await Promise.resolve(searchParams.get('mode'));

  if (mode === 'full') {
    // Prueba completa con datos de pedido simulado
    const result = await notifyNewOrder({
      reference: 'PEDIDO-TEST-' + Date.now(),
      customerName: 'Cliente Prueba',
      customerPhone: '+573174503604',
      customerEmail: 'prueba@restaurante.com',
      address: 'Calle 1A # 6-7',
      city: 'Colón',
      items: [
        { name: 'Bandeja Paisa', quantity: 2 },
        { name: 'Jugo de Lulo', quantity: 2 },
      ],
      total: 56000,
      serviceType: 'domicilio',
      notes: 'Sin cebolla por favor',
    });

    return NextResponse.json({
      success: result,
      message: result ? 'Notificación de pedido de prueba enviada' : 'Error al enviar',
    });
  }

  const result = await sendTestNotification();
  return NextResponse.json(result);
}
