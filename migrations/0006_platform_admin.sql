-- Panel de la plataforma (/panel): visitas anónimas a la landing y nota de los pagos manuales.

-- Nota libre de un pago registrado a mano (p. ej. número de comprobante de Nequi)
ALTER TABLE subscription_payments ADD COLUMN notes TEXT;

-- Una fila por sesión de navegador en las páginas públicas de la plataforma (brasaya.com).
-- Sin IP ni datos personales: visitor_id es un código aleatorio guardado en el navegador.
CREATE TABLE site_visits (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  visitor_id  TEXT NOT NULL,
  -- Día en hora de Colombia (AAAA-MM-DD), para agrupar sin convertir zonas en cada consulta
  day         TEXT NOT NULL,
  path        TEXT NOT NULL,
  referrer    TEXT,
  utm_source  TEXT,
  device      TEXT NOT NULL,
  os          TEXT NOT NULL,
  browser     TEXT NOT NULL,
  country     TEXT,
  signed_in   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_site_visits_day ON site_visits (day);
CREATE INDEX idx_site_visits_visitor ON site_visits (visitor_id, created_at);

-- Acciones de los administradores de Brasaya desde /panel (quién, qué, a qué restaurante).
-- Sin FK a restaurants: el registro debe sobrevivir al borrado del restaurante.
CREATE TABLE platform_audit (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_email     TEXT NOT NULL,
  action          TEXT NOT NULL,
  restaurant_id   TEXT,
  restaurant_name TEXT,
  detail          TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_platform_audit_created ON platform_audit (created_at);
