// Configuración de Wompi para el restaurante
export const WOMPI_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '',
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1',
  checkoutUrl: 'https://checkout.wompi.co/p/',
};

export interface PaymentLinkParams {
  amount: number;
  currency: 'COP';
  reference: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  redirectUrl: string;
}

/**
 * Crea un enlace de pago en Wompi
 */
export async function createPaymentLink(params: PaymentLinkParams) {
  try {
    const body = {
      name: params.description,
      description: params.description,
      single_use: true, // Link de un solo uso
      collect_shipping: false,
      currency: params.currency,
      amount_in_cents: params.amount * 100, // Wompi maneja centavos
      redirect_url: params.redirectUrl,
      expiration_time: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 horas
    };

    const response = await fetch(`/api/wompi/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        reference: params.reference,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el enlace de pago');
    }

    return data;
  } catch (error) {
    console.error('Error creating Wompi payment link:', error);
    throw error;
  }
}

/**
 * Verifica el estado de una transacción en Wompi
 */
export async function getTransactionStatus(transactionId: string) {
  try {
    const response = await fetch(
      `${WOMPI_CONFIG.apiUrl}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_CONFIG.publicKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al verificar el estado de la transacción');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
}

/**
 * Genera una referencia única para un pago
 */
export function generatePaymentReference(type: 'RESERVA' | 'PEDIDO'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type}-${random}-${timestamp}`;
}

/**
 * Formatea un monto en COP
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}
