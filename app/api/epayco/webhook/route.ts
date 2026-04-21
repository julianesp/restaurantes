import { NextResponse } from 'next/server';
import { notifyNewOrder, notifyNewReservation, notifyPaymentError } from '../../../../lib/notificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('ePayco webhook received:', body);

    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_transaction_state,
      x_invoice,
      x_approval_code,
      x_extra1,
      x_extra2,
      x_customer_name,
      x_customer_phone,
      x_customer_email,
    } = body;

    if (x_transaction_state === 'Aceptada') {
      console.log(`✅ Pago exitoso - Referencia: ${x_invoice}, ePayco Ref: ${x_ref_payco}`);

      const isReservation = x_invoice?.startsWith('RESERVA') || x_extra2 === 'reserva';

      if (isReservation) {
        // Recuperar datos de la reserva (guardados en localStorage por el frontend)
        // El webhook no tiene acceso a localStorage, usamos los datos del webhook
        await notifyNewReservation({
          reference: x_invoice,
          customerName: x_customer_name || 'Cliente',
          customerPhone: x_customer_phone || 'No especificado',
          date: 'Ver referencia',
          time: 'Ver referencia',
          people: 'Ver referencia',
          transactionId: x_transaction_id,
        }).catch(() => {}); // No bloquear si falla
      } else {
        // Pedido normal
        const amountNumber = parseFloat(x_amount || '0');

        await notifyNewOrder({
          reference: x_invoice,
          customerName: x_customer_name || 'Cliente',
          customerPhone: x_customer_phone || 'No especificado',
          customerEmail: x_customer_email,
          items: [{ name: 'Ver detalles en referencia', quantity: 1 }],
          total: amountNumber,
          transactionId: x_transaction_id,
        }).catch(() => {}); // No bloquear si falla
      }

    } else if (x_transaction_state === 'Rechazada') {
      console.log(`❌ Pago rechazado - Referencia: ${x_invoice}`);
      await notifyPaymentError(`Pago rechazado`, { reference: x_invoice, transactionId: x_transaction_id }).catch(() => {});
    } else {
      console.log(`⏳ Pago pendiente - Referencia: ${x_invoice}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing ePayco webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refPayco = await Promise.resolve(searchParams.get('ref_payco'));
  console.log('ePayco confirmation GET:', refPayco);
  return NextResponse.json({ success: true, ref_payco: refPayco });
}
