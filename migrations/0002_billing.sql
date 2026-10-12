-- Suscripción mensual de cada restaurante a Brasaya (pago prepagado por ePayco Checkout).
--
-- El acceso vale hasta la fecha mayor entre trial_ends_at (prueba de 14 días) y paid_until
-- (último mes pagado). El estado efectivo se calcula en lib/billing.ts a partir de esas fechas.

ALTER TABLE restaurants ADD COLUMN paid_until TEXT;

CREATE TABLE subscription_payments (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Referencia propia enviada a ePayco (invoice / extra1). Única para que un pago no se aplique dos veces.
  reference     TEXT NOT NULL UNIQUE,
  amount        INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'COP',
  months        INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'failed')),
  -- Datos de ePayco, solo tras validar la transacción contra su API
  ref_payco     TEXT,
  payment_method TEXT,
  -- Periodo que cubre este pago (al aprobarse)
  period_start  TEXT,
  period_end    TEXT,
  created_by    TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_subscription_payments_restaurant ON subscription_payments (restaurant_id, created_at);
CREATE UNIQUE INDEX idx_subscription_payments_ref_payco ON subscription_payments (ref_payco) WHERE ref_payco IS NOT NULL;
