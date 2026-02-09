// Configuración de ePayco para el restaurante
export const EPAYCO_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || '',
  privateKey: process.env.EPAYCO_PRIVATE_KEY || '',
  pCustIdCliente: process.env.EPAYCO_P_CUST_ID_CLIENTE || '',
  pKey: process.env.EPAYCO_P_KEY || '',
  testMode: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true',
  apiUrl: 'https://api.secure.payco.co',
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
 * Crea un enlace de pago en ePayco
 */
export async function createPaymentLink(params: PaymentLinkParams) {
  try {
    const response = await fetch(`/api/epayco/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        description: params.description,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        redirectUrl: params.redirectUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el enlace de pago');
    }

    return data;
  } catch (error) {
    console.error('Error creating ePayco payment link:', error);
    throw error;
  }
}

/**
 * Verifica el estado de una transacción en ePayco
 */
export async function getTransactionStatus(transactionId: string) {
  try {
    const response = await fetch(`/api/epayco/transaction/${transactionId}`, {
      method: 'GET',
    });

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
