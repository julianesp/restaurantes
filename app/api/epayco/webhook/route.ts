import { NextResponse } from 'next/server';

/**
 * Webhook de ePayco para recibir confirmaciones de pago
 * ePayco enviará una petición POST aquí cuando se complete un pago
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('ePayco webhook received:', body);

    // Aquí puedes procesar la confirmación del pago
    // body contiene información como:
    // - x_ref_payco: Referencia de ePayco
    // - x_transaction_id: ID de transacción
    // - x_amount: Monto
    // - x_currency_code: Código de moneda
    // - x_transaction_state: Estado (Aceptada, Rechazada, Pendiente)
    // - x_approval_code: Código de aprobación
    // - x_response: Respuesta
    // - x_invoice: Tu referencia

    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_transaction_state,
      x_invoice,
      x_approval_code,
    } = body;

    // Aquí puedes actualizar el estado en tu base de datos
    if (x_transaction_state === 'Aceptada') {
      console.log(`✅ Pago exitoso - Referencia: ${x_invoice}, ePayco Ref: ${x_ref_payco}`);
      // TODO: Actualizar estado del pedido/reserva en Supabase
    } else if (x_transaction_state === 'Rechazada') {
      console.log(`❌ Pago rechazado - Referencia: ${x_invoice}`);
      // TODO: Marcar como rechazado en Supabase
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

// También aceptar GET para confirmación
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refPayco = searchParams.get('ref_payco');

  console.log('ePayco confirmation GET:', refPayco);

  return NextResponse.json({ success: true, ref_payco: refPayco });
}
