import { NextResponse } from 'next/server';
import epayco from 'epayco-sdk-node';

const epaycoClient = epayco({
  apiKey: process.env.EPAYCO_P_KEY!,
  privateKey: process.env.EPAYCO_PRIVATE_KEY!,
  lang: 'ES',
  test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount,
      reference,
      description,
      customerEmail,
      customerName,
      customerPhone,
      redirectUrl,
    } = body;

    // Validaciones
    if (!amount || !reference || !description) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Crear pago en ePayco usando el método de checkout
    const paymentData = {
      // Información del comercio
      name: description,
      description: description,
      invoice: reference,
      currency: 'cop',
      amount: amount.toString(),
      tax_base: '0',
      tax: '0',
      country: 'co',
      lang: 'es',

      // URLs
      external: 'false',
      response: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      confirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/epayco/webhook`,

      // Información del cliente
      name_billing: customerName || 'Cliente',
      email_billing: customerEmail || 'cliente@example.com',
      mobilephone_billing: customerPhone || '',

      // Configuración adicional
      methodsDisable: ['SP', 'CASH'], // Deshabilitar SafetyPay y efectivo
    };

    // Crear el pago
    const payment = await epaycoClient.pagos.create(paymentData);

    if (!payment.success) {
      throw new Error(payment.data?.description || 'Error al crear el pago');
    }

    return NextResponse.json({
      success: true,
      paymentUrl: payment.data.url_payment,
      reference: reference,
      transactionId: payment.data.ref_payco,
    });
  } catch (error: any) {
    console.error('Error creating ePayco payment:', error);
    return NextResponse.json(
      {
        error: 'Error al crear el enlace de pago con ePayco',
        details: error.message
      },
      { status: 500 }
    );
  }
}
