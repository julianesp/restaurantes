import { NextResponse } from 'next/server';
import { publicCtx } from '@/lib/tenant';
import { createCheckoutSession } from '@/lib/epayco';
import { restaurantCredentials } from '@/lib/payment-accounts';
import { limitRequest } from '@/lib/rate-limit';

// POST: sesión de pago de un cliente. Cobra con la cuenta de ePayco DEL RESTAURANTE: el dinero
// llega a su cuenta, nunca a la de Brasaya. Sin cuenta conectada no hay pago en línea.
export async function POST(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    // 20 sesiones de pago por IP cada 10 minutos
    const limited = await limitRequest(request, 'pay', tenant.id, 20, 10 * 60_000);
    if (limited) return limited;

    const credentials = await restaurantCredentials(tenant.id);
    if (!credentials) {
      return NextResponse.json(
        { error: 'Este restaurante todavía no recibe pagos en línea. Haz tu pedido por WhatsApp.' },
        { status: 409 }
      );
    }

    const { amount, reference, description, customerEmail, customerName, customerPhone, redirectUrl } = await request.json();
    const amountNum = Math.round(Number(amount));
    if (!amountNum || amountNum <= 0 || !reference || !description) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Cada restaurante tiene su propio subdominio: se usa el origen de la petición
    const baseUrl = new URL(request.url).origin;
    // La vuelta solo puede ir al propio sitio del restaurante (evita redirecciones abiertas). En
    // desarrollo los modales usan una URL pública configurada, porque ePayco rechaza localhost.
    const allowedBases = [baseUrl, process.env.NEXT_PUBLIC_BASE_URL, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean);
    const response =
      typeof redirectUrl === 'string' && allowedBases.some((b) => redirectUrl.startsWith(`${b}/`))
        ? redirectUrl
        : `${baseUrl}/payment/success`;

    const session = await createCheckoutSession({
      name: tenant.name,
      amount: amountNum,
      description: String(description).slice(0, 250),
      invoice: String(reference).slice(0, 60),
      responseUrl: response,
      confirmationUrl: `${baseUrl}/api/epayco/webhook`,
      extras: { extra1: String(reference), extra2: 'pedido', extra3: tenant.slug },
      billing: { email: customerEmail, name: customerName, phone: customerPhone },
      credentials,
    });

    return NextResponse.json({ success: true, sessionId: session.sessionId, sessionToken: session.token, reference });
  } catch (error: unknown) {
    console.error('Error creating ePayco payment:', error);
    return NextResponse.json({ error: 'Error al crear el enlace de pago con ePayco' }, { status: 500 });
  }
}
