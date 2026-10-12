import { NextResponse } from 'next/server';
import { notifyNewReservation, targetFor } from '../../../lib/notificationService';
import { publicCtx } from '@/lib/tenant';

export async function POST(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();

    const { reference, customerName, customerPhone, date, time, people, comments, transactionId } = body;

    if (!reference || !customerName) {
      return NextResponse.json({ error: 'Faltan datos de la reserva' }, { status: 400 });
    }

    await notifyNewReservation({
      reference,
      customerName,
      customerPhone: customerPhone || 'No especificado',
      date: date || 'No especificada',
      time: time || 'No especificada',
      people: people || 'No especificado',
      comments,
      transactionId,
    }, targetFor(ctx.tenant));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reservation notification:', error);
    return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}
