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

    // ePayco requiere taxBase + tax == amount exactamente
    // Para evitar problemas de redondeo, enviamos sin IVA desglosado
    const amountNum = Math.round(Number(amount));

    // Paso 1: Autenticarse con ePayco Apify
    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY!;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY!;
    const basicAuth = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');

    const authResponse = await fetch('https://apify.epayco.co/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ public_key: publicKey }),
    });

    const authResult = await authResponse.json();

    if (!authResult.token) {
      throw new Error('No se pudo autenticar con ePayco');
    }

    const bearerToken = authResult.token;
    const isTest = process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Paso 2: Crear sesión de pago
    const sessionData = {
      checkout_version: "2",
      name: "Restaurante",
      currency: "COP",
      amount: amountNum,
      description: description,
      lang: "ES",
      invoice: reference,
      country: "CO",
      taxBase: amountNum,
      tax: 0,
      taxIco: 0,
      test: isTest,
      response: redirectUrl || `${baseUrl}/payment/success`,
      confirmation: `${baseUrl}/api/epayco/webhook`,
      methodsDisable: ["SP", "CASH"],
      method: "POST",
      billing: {
        email: customerEmail || "cliente@restaurante.com",
        name: customerName || "Cliente",
        address: "Restaurante",
        typeDoc: "CC",
        numberDoc: "0",
        callingCode: "+57",
        mobilePhone: customerPhone || "3000000000",
      },
      extras: {
        extra1: reference,
        extra2: "pedido",
      },
    };

    const sessionResponse = await fetch('https://apify.epayco.co/payment/session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(sessionData),
    });

    const sessionResult = await sessionResponse.json();

    if (!sessionResult.success || !sessionResult.data?.sessionId) {
      console.error('ePayco session error:', JSON.stringify(sessionResult));
      throw new Error(sessionResult.textResponse || sessionResult.message || JSON.stringify(sessionResult));
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionResult.data.sessionId,
      sessionToken: sessionResult.data.token,
      reference: reference,
    });
  } catch (error: unknown) {
    console.error('Error creating ePayco payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        error: 'Error al crear el enlace de pago con ePayco',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
