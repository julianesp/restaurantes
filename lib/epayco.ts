/**
 * ePayco: creación de sesiones de Checkout y validación de transacciones.
 *
 * Seguridad: lo que llega al webhook (o en la URL de respuesta) NO se cree tal cual. Antes de dar
 * por pagado algo se consulta la transacción en la API de validación de ePayco por su ref_payco y
 * se usan solo esos datos.
 */

export interface CheckoutSessionInput {
  /** Nombre que ve el cliente en el checkout */
  name: string;
  amount: number;
  description: string;
  /** Referencia propia (invoice) */
  invoice: string;
  /** URL a la que vuelve el navegador tras pagar */
  responseUrl: string;
  /** URL del webhook de confirmación */
  confirmationUrl: string;
  extras: { extra1?: string; extra2?: string; extra3?: string };
  billing?: { email?: string; name?: string; phone?: string };
}

const isTest = () => process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === "true";

/** Crea una sesión de ePayco Checkout v2 y devuelve su sessionId. */
export async function createCheckoutSession(input: CheckoutSessionInput): Promise<{ sessionId: string; token?: string }> {
  const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
  const privateKey = process.env.EPAYCO_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("Faltan las llaves de ePayco");

  // 1) Autenticación (Apify)
  const basicAuth = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");
  const authResponse = await fetch("https://apify.epayco.co/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${basicAuth}` },
    body: JSON.stringify({ public_key: publicKey }),
  });
  const auth = (await authResponse.json()) as { token?: string };
  if (!auth.token) throw new Error("No se pudo autenticar con ePayco");

  // 2) Sesión de pago. ePayco exige taxBase + tax == amount: se envía sin IVA desglosado.
  const amount = Math.round(input.amount);
  const session = {
    checkout_version: "2",
    name: input.name,
    currency: "COP",
    amount,
    description: input.description,
    lang: "ES",
    invoice: input.invoice,
    country: "CO",
    taxBase: amount,
    tax: 0,
    taxIco: 0,
    test: isTest(),
    response: input.responseUrl,
    confirmation: input.confirmationUrl,
    methodsDisable: ["SP", "CASH"],
    method: "POST",
    billing: {
      email: input.billing?.email || "cliente@brasaya.com",
      name: input.billing?.name || "Cliente",
      address: "Colombia",
      typeDoc: "CC",
      numberDoc: "0",
      callingCode: "+57",
      mobilePhone: input.billing?.phone || "3000000000",
    },
    extras: input.extras,
  };

  const res = await fetch("https://apify.epayco.co/payment/session/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify(session),
  });
  const result = (await res.json()) as {
    success?: boolean;
    data?: { sessionId?: string; token?: string };
    textResponse?: string;
    message?: string;
  };
  if (!result.success || !result.data?.sessionId) {
    console.error("ePayco session error:", JSON.stringify(result));
    throw new Error(result.textResponse || result.message || "ePayco no creó la sesión de pago");
  }
  return { sessionId: result.data.sessionId, token: result.data.token };
}

/** Datos de una transacción según la API de validación de ePayco. */
export interface EpaycoTransaction {
  refPayco: string;
  /** 1 = Aceptada, 2 = Rechazada, 3 = Pendiente, 4 = Fallida (y otros códigos de ePayco) */
  codResponse: number;
  state: string;
  amount: number;
  currency: string;
  invoice: string;
  extra1: string;
  extra2: string;
  extra3: string;
  method: string;
  isTest: boolean;
}

/**
 * Consulta una transacción en ePayco por su ref_payco. Devuelve null si no existe o la API falla.
 * Es la única fuente que se usa para marcar pagos como aprobados.
 */
export async function validateTransaction(refPayco: string): Promise<EpaycoTransaction | null> {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(refPayco)) return null;
  try {
    const res = await fetch(`https://secure.epayco.co/validation/v1/reference/${encodeURIComponent(refPayco)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    // Una referencia inexistente responde 200 con { status: false, ... }: solo valen respuestas
    // que traen los datos de la transacción.
    const body = (await res.json()) as { success?: boolean; status?: boolean; data?: Record<string, unknown> };
    const d = body.data;
    if (body.success === false || body.status === false || !d || !d.x_ref_payco) return null;
    const s = (k: string) => (d[k] === undefined || d[k] === null ? "" : String(d[k]));
    return {
      refPayco: s("x_ref_payco"),
      codResponse: Number(d.x_cod_response ?? d.x_cod_transaction_state ?? 0),
      state: s("x_transaction_state") || s("x_response"),
      amount: Math.round(Number(d.x_amount ?? 0)),
      currency: s("x_currency_code"),
      invoice: s("x_id_invoice") || s("x_invoice"),
      extra1: s("x_extra1"),
      extra2: s("x_extra2"),
      extra3: s("x_extra3"),
      method: s("x_franchise") || s("x_bank_name"),
      isTest: s("x_test_request") === "TRUE" || s("x_test_request") === "true",
    };
  } catch (error) {
    console.error("[epayco] Error validando transacción:", error);
    return null;
  }
}

/** Lee el cuerpo del webhook: ePayco envía formulario (x-www-form-urlencoded) o JSON. */
export async function readWebhookBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, v == null ? "" : String(v)]));
  }
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}
