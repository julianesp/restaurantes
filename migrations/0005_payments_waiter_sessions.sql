-- Cuenta de ePayco de cada restaurante y sesiones de meseros.

-- Los pagos de los clientes de un restaurante van a SU cuenta de ePayco (no a la de Brasaya).
-- La llave privada se guarda cifrada con AES-GCM (lib/crypto.ts, secreto APP_SECRET).
-- Separado de restaurants.settings a propósito: settings circula por el layout y la caché del tenant.
CREATE TABLE restaurant_payment_accounts (
  restaurant_id    TEXT PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL DEFAULT 'epayco' CHECK (provider IN ('epayco')),
  public_key       TEXT NOT NULL,
  private_key_enc  TEXT NOT NULL,
  -- Última vez que ePayco aceptó estas llaves (se prueban al guardarlas)
  verified_at      TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Sesión de un mesero tras validar su PIN (lib/waiter-session.ts). Se guarda el HMAC del token,
-- nunca el token. Borrar o desactivar al mesero invalida sus sesiones.
CREATE TABLE waiter_sessions (
  token_hash     TEXT PRIMARY KEY,
  waiter_id      TEXT NOT NULL REFERENCES waiters(id) ON DELETE CASCADE,
  restaurant_id  TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  expires_at     TEXT NOT NULL,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_waiter_sessions_waiter ON waiter_sessions (waiter_id);
CREATE INDEX idx_waiter_sessions_expires ON waiter_sessions (expires_at);
