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

    // Calcular base e impuesto (19% IVA en Colombia)
    const taxRate = 0.19;
    const taxBase = Math.round(amount / (1 + taxRate));
    const tax = amount - taxBase;

    // Datos del pago para ePayco Checkout v2
    const paymentData = {
      // ==================== REQUERIDOS ====================
      checkout_version: "2",
      name: "Restaurante Munay",
      currency: "COP",
      amount: parseFloat(amount.toString()),

      // ==================== OPCIONALES ====================
      description: description,
      lang: "ES",
      invoice: reference,
      country: "CO",
      taxBase: parseFloat(taxBase.toString()),
      tax: parseFloat(tax.toString()),
      taxIco: 0,
      response: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      confirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/epayco/webhook`,

      // ==================== CONFIGURACIÓN ====================
      methodsDisable: ["SP", "CASH"], // Deshabilitar SafetyPay y efectivo
      method: "POST",

      // ==================== BILLING (OPCIONAL) ====================
      billing: {
        email: customerEmail || "cliente@restaurante.com",
        name: customerName || "Cliente",
        address: "Restaurante",
        typeDoc: "CC",
        numberDoc: "0",
        callingCode: "+57",
        mobilePhone: customerPhone || "3000000000",
      },

      // ==================== EXTRAS (OPCIONAL) ====================
      extras: {
        extra1: reference,
        extra2: "pedido",
      },
    };

    console.log('Creating ePayco payment v2 with data:', {
      ...paymentData,
      billing: { ...paymentData.billing, numberDoc: '***' }
    });

    // Crear el pago usando ePayco Checkout API v2
    const epaycoUrl = 'https://apify.epayco.co/payment/process';

    const response = await fetch(epaycoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY}`,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    console.log('ePayco API v2 response:', result);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(result.message || result.error || 'Error al crear el pago en ePayco');
    }

    // ePayco v2 retorna diferentes estructuras según el resultado
    let paymentUrl = null;
    let transactionId = null;

    if (result.success) {
      // Caso exitoso con URL
      paymentUrl = result.data?.url || result.data?.urlPayment || result.url;
      transactionId = result.data?.ref || result.data?.transactionId || reference;
    } else if (result.data?.url) {
      // A veces viene en data.url directamente
      paymentUrl = result.data.url;
      transactionId = result.data.ref || reference;
    } else if (result.url) {
      // O directamente en url
      paymentUrl = result.url;
      transactionId = result.ref || reference;
    }

    if (!paymentUrl) {
      console.error('No payment URL in response:', result);
      throw new Error('No se recibió URL de pago de ePayco');
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
      reference: reference,
      transactionId: transactionId,
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
