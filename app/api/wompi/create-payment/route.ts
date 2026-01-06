import { NextRequest, NextResponse } from 'next/server';

const WOMPI_CONFIG = {
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      amount_in_cents,
      currency,
      redirect_url,
      expiration_time,
      customerEmail,
      customerName,
      customerPhone,
      reference,
    } = body;

    // Validaciones
    if (!name || !amount_in_cents || !currency) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    if (!WOMPI_CONFIG.privateKey) {
      console.error('WOMPI_PRIVATE_KEY no está configurada');
      return NextResponse.json(
        { error: 'Configuración de pagos no disponible' },
        { status: 500 }
      );
    }

    // Crear el enlace de pago en Wompi
    const wompiBody: any = {
      name,
      description,
      single_use: true,
      collect_shipping: false,
      currency,
      amount_in_cents,
      redirect_url,
      expiration_time,
    };

    // Agregar metadata opcional
    if (customerEmail || customerName || customerPhone || reference) {
      wompiBody.meta = {
        ...(customerEmail && { customer_email: customerEmail }),
        ...(customerName && { customer_name: customerName }),
        ...(customerPhone && { customer_phone: customerPhone }),
        ...(reference && { reference }),
      };
    }

    console.log('Creating Wompi payment link:', {
      url: `${WOMPI_CONFIG.apiUrl}/payment_links`,
      body: wompiBody,
    });

    const response = await fetch(`${WOMPI_CONFIG.apiUrl}/payment_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WOMPI_CONFIG.privateKey}`,
      },
      body: JSON.stringify(wompiBody),
    });

    const data = await response.json();

    console.log('Wompi API Response:', {
      status: response.status,
      data: data,
    });

    if (!response.ok) {
      console.error('Wompi API Error:', {
        status: response.status,
        error: data,
      });
      return NextResponse.json(
        { error: data.error?.messages || 'Error al crear el enlace de pago' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in create-payment API:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
