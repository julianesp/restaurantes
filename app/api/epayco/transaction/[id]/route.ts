import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Consultar el estado de la transacción usando la API de ePayco
    const response = await fetch(
      `https://secure.epayco.co/validation/v1/reference/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.EPAYCO_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('No se pudo obtener el estado de la transacción');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error: any) {
    console.error('Error getting transaction status:', error);
    return NextResponse.json(
      {
        error: 'Error al verificar el estado de la transacción',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
