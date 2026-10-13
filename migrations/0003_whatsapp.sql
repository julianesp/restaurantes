-- Mensajes automáticos de Brasaya por WhatsApp (API de WhatsApp Cloud, ver lib/whatsapp.ts).
--
-- Cada envío queda registrado: sirve para no repetir un aviso (dedupe_key), limitar el volumen
-- por restaurante y seguir el estado que Meta reporta por el webhook (/api/whatsapp/webhook).

CREATE TABLE whatsapp_messages (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Tipo de aviso: 'nuevo_pedido' | 'recordatorio_pago' | 'prueba'
  kind          TEXT NOT NULL,
  -- Clave de idempotencia (p. ej. "order:<slug>:<referencia>"): un mismo aviso se envía una sola vez
  dedupe_key    TEXT UNIQUE,
  to_phone      TEXT NOT NULL,
  template      TEXT NOT NULL,
  -- Id del mensaje que devuelve Meta (wamid.…), para casar los estados del webhook
  wamid         TEXT UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_whatsapp_messages_restaurant ON whatsapp_messages (restaurant_id, kind, created_at);
