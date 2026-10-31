import { NextResponse } from 'next/server';
import { notifyNewOrder, notifyNewReservation, notifyPaymentError, targetFor } from '../../../../lib/notificationService';
import { getTenantBySlug } from '@/lib/tenant';
import { readWebhookBody, validateTransaction } from '@/lib/epayco';
import { applySubscriptionPayment, SUBSCRIPTION_KIND } from '@/lib/subscriptions';
import { whatsappNewOrder } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    // ePayco envía la confirmación como formulario (o JSON, según la configuración)
    const body = await readWebhookBody(request);

    console.log('ePayco webhook received:', { ref: body.x_ref_payco, invoice: body.x_invoice, state: body.x_transaction_state, kind: body.x_extra2 });

    // Mensualidad de Brasaya: se valida contra la API de ePayco y se suma el mes (idempotente)
    if (body.x_extra2 === SUBSCRIPTION_KIND || String(body.x_invoice || body.x_id_invoice || '').toUpperCase().startsWith('BRSY-')) {
      const result = await applySubscriptionPayment(String(body.x_ref_payco || ''));
      console.log('Suscripción:', body.x_extra3, result);
      return NextResponse.json({ success: true });
    }

    // Pedido o reserva de un cliente: solo se cree a la API de validación de ePayco (un webhook
    // falsificado no dispara avisos de "pedido pagado"). El restaurante viaja en extra3.
    const tx = await validateTransaction(String(body.x_ref_payco || ''));
    if (!tx) {
      console.error('ePayco webhook: transacción no encontrada en ePayco:', body.x_ref_payco);
      return NextResponse.json({ success: true });
    }
    if (tx.isTest && process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE !== 'true') {
      console.error('ePayco webhook: transacción de prueba en producción ignorada:', tx.refPayco);
      return NextResponse.json({ success: true });
    }

    const tenant = tx.extra3 ? await getTenantBySlug(tx.extra3) : null;
    if (!tenant) {
      console.error('ePayco webhook sin restaurante identificable (x_extra3):', tx.extra3);
      return NextResponse.json({ success: true });
    }
    const target = targetFor(tenant);

    // Datos verificados (monto, estado, referencia); nombre y teléfono solo sirven para el aviso
    const x_ref_payco = tx.refPayco;
    const x_transaction_id = String(body.x_transaction_id || tx.refPayco);
    const x_amount = String(tx.amount);
    const x_transaction_state = tx.codResponse === 1 ? 'Aceptada' : tx.codResponse === 2 || tx.codResponse === 4 ? 'Rechazada' : 'Pendiente';
    const x_invoice = tx.invoice || tx.extra1;
    const x_extra2 = tx.extra2;
    const { x_customer_name, x_customer_phone, x_customer_email } = body;

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
        }, target).catch(() => {}); // No bloquear si falla
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
        }, target).catch(() => {}); // No bloquear si falla

        // WhatsApp: una sola vez por referencia (también puede llegar desde /api/notify-order)
        await whatsappNewOrder(tenant, {
          reference: String(x_invoice || ''),
          customerName: x_customer_name || 'Cliente',
          total: amountNumber,
        }).catch((error) => console.error('[WHATSAPP] aviso de pedido:', error));
      }

    } else if (x_transaction_state === 'Rechazada') {
      console.log(`❌ Pago rechazado - Referencia: ${x_invoice}`);
      await notifyPaymentError(`Pago rechazado`, { reference: x_invoice, transactionId: x_transaction_id }, target).catch(() => {});
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
