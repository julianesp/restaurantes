/**
 * Cuenta de ePayco de cada restaurante: los pagos de SUS clientes llegan a SU cuenta.
 * La cuenta de Brasaya (platformCredentials) solo cobra la mensualidad de la plataforma.
 *
 * La llave privada se guarda cifrada (lib/crypto.ts) en restaurant_payment_accounts y nunca vuelve
 * al navegador. restaurants.settings.online_payments solo indica si hay cuenta (para la interfaz).
 */
import { first, nowIso, run } from "@/lib/db";
import { decryptText, encryptText } from "@/lib/crypto";
import { epaycoLogin, type EpaycoCredentials } from "@/lib/epayco";
import { invalidateTenantCache, type Tenant } from "@/lib/tenant";

export interface PaymentAccountStatus {
  configured: boolean;
  /** Llave pública con solo los últimos caracteres visibles */
  publicKeyHint: string | null;
  verifiedAt: string | null;
}

// Las llaves de ePayco son cadenas hexadecimales/alfanuméricas largas
const KEY_REGEX = /^[A-Za-z0-9_-]{16,128}$/;

const hint = (key: string) => `••••${key.slice(-4)}`;

export async function paymentAccountStatus(restaurantId: string): Promise<PaymentAccountStatus> {
  const row = await first<{ public_key: string; verified_at: string | null }>(
    "SELECT public_key, verified_at FROM restaurant_payment_accounts WHERE restaurant_id = ?",
    restaurantId
  );
  return { configured: !!row, publicKeyHint: row ? hint(row.public_key) : null, verifiedAt: row?.verified_at ?? null };
}

/** Llaves del restaurante para crear sesiones de pago, o null si no configuró su cuenta. */
export async function restaurantCredentials(restaurantId: string): Promise<EpaycoCredentials | null> {
  const row = await first<{ public_key: string; private_key_enc: string }>(
    "SELECT public_key, private_key_enc FROM restaurant_payment_accounts WHERE restaurant_id = ?",
    restaurantId
  );
  if (!row) return null;
  return { publicKey: row.public_key, privateKey: await decryptText(row.private_key_enc) };
}

export type SaveResult = { ok: true; status: PaymentAccountStatus } | { ok: false; error: string };

/** Prueba las llaves contra ePayco y, si sirven, las guarda y activa los pagos en línea. */
export async function savePaymentAccount(tenant: Tenant, input: { publicKey?: unknown; privateKey?: unknown }): Promise<SaveResult> {
  const publicKey = typeof input.publicKey === "string" ? input.publicKey.trim() : "";
  const privateKey = typeof input.privateKey === "string" ? input.privateKey.trim() : "";
  if (!KEY_REGEX.test(publicKey) || !KEY_REGEX.test(privateKey)) {
    return { ok: false, error: "Las llaves no tienen el formato de ePayco. Cópialas de tu panel de ePayco: Integraciones → Llaves API." };
  }
  if (!(await epaycoLogin({ publicKey, privateKey }))) {
    return { ok: false, error: "ePayco rechazó estas llaves. Revisa que sean la PUBLIC_KEY y la PRIVATE_KEY de tu cuenta." };
  }

  const now = nowIso();
  await run(
    `INSERT INTO restaurant_payment_accounts (restaurant_id, provider, public_key, private_key_enc, verified_at)
     VALUES (?, 'epayco', ?, ?, ?)
     ON CONFLICT (restaurant_id) DO UPDATE SET
       public_key = excluded.public_key, private_key_enc = excluded.private_key_enc,
       verified_at = excluded.verified_at, updated_at = ?`,
    tenant.id, publicKey, await encryptText(privateKey), now, now
  );
  await setOnlinePaymentsFlag(tenant, true);
  return { ok: true, status: await paymentAccountStatus(tenant.id) };
}

/** Borra la cuenta del restaurante: los clientes vuelven a pedir por WhatsApp. */
export async function deletePaymentAccount(tenant: Tenant): Promise<void> {
  await run("DELETE FROM restaurant_payment_accounts WHERE restaurant_id = ?", tenant.id);
  await setOnlinePaymentsFlag(tenant, false);
}

// En SQL (json_set/json_remove) y no con la copia en caché del tenant, para no pisar otros ajustes
async function setOnlinePaymentsFlag(tenant: Tenant, enabled: boolean) {
  const expr = enabled
    ? "json_set(COALESCE(settings, '{}'), '$.online_payments', json('true'))"
    : "json_remove(COALESCE(settings, '{}'), '$.online_payments')";
  await run(`UPDATE restaurants SET settings = ${expr}, updated_at = ? WHERE id = ?`, nowIso(), tenant.id);
  invalidateTenantCache(tenant.slug);
}
