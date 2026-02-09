import { NextResponse } from 'next/server';
import epayco from 'epayco-sdk-node';

const epaycoClient = epayco({
  apiKey: process.env.EPAYCO_P_KEY!,
  privateKey: process.env.EPAYCO_PRIVATE_KEY!,
  lang: 'ES',
  test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true',
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Consultar el estado de la transacción en ePayco
    const transaction = await epaycoClient.charge.get(id);

    if (!transaction.success) {
      throw new Error('No se pudo obtener el estado de la transacción');
    }

    return NextResponse.json({
      success: true,
      data: transaction.data,
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
