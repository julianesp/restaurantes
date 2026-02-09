import { NextResponse } from 'next/server';

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

    // Datos del pago para ePayco
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

      // Llaves de ePayco
      public_key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY!,

      // URLs de respuesta y confirmación
      external: 'false',
      response: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      confirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/epayco/webhook`,

      // Información del cliente
      name_billing: customerName || 'Cliente',
      email_billing: customerEmail || 'cliente@example.com',
      mobilephone_billing: customerPhone || '',

      // Información adicional
      type_person: '0', // 0 = Persona natural, 1 = Empresa

      // Métodos de pago deshabilitados
      methodsDisable: ['SP', 'CASH'].join(','),
    };

    console.log('Creating ePayco payment with data:', {
      ...paymentData,
      public_key: '***',
    });

    // Crear el pago usando la API REST de ePayco
    const response = await fetch('https://secure.epayco.co/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    console.log('ePayco API response:', result);

    if (!response.ok || !result.success) {
      throw new Error(result.data?.description || result.data || 'Error al crear el pago en ePayco');
    }

    // ePayco retorna la URL en data.url_payment
    const paymentUrl = result.data?.url_payment || result.data;

    if (!paymentUrl) {
      throw new Error('No se recibió URL de pago de ePayco');
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
      reference: reference,
      transactionId: result.data?.ref_payco || reference,
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
