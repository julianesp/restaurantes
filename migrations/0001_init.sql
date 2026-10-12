-- Esquema inicial multi-tenant en Cloudflare D1 (SQLite).
-- Convenciones: ids TEXT (hex aleatorio o UUID importado), booleanos INTEGER 0/1,
-- fechas TEXT ISO-8601 UTC, JSON en TEXT.

-- ---------------------------------------------------------------------------
-- Plataforma
-- ---------------------------------------------------------------------------
CREATE TABLE restaurants (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug          TEXT NOT NULL UNIQUE CHECK (length(slug) BETWEEN 3 AND 30),
  name          TEXT NOT NULL,
  custom_domain TEXT UNIQUE,
  status        TEXT NOT NULL DEFAULT 'trial'
                CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'canceled')),
  plan          TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TEXT,
  owner_email   TEXT NOT NULL,
  -- JSON: marca, contacto y configuración de notificaciones
  settings      TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE restaurant_members (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (restaurant_id, email)
);
CREATE INDEX idx_members_email ON restaurant_members (email);

-- ---------------------------------------------------------------------------
-- Menú
-- ---------------------------------------------------------------------------
CREATE TABLE menu_categories (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  icon          TEXT,
  color         TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (restaurant_id, slug)
);

CREATE TABLE menu_items (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   TEXT REFERENCES menu_categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         TEXT NOT NULL,
  image         TEXT,
  is_vegetarian INTEGER NOT NULL DEFAULT 0,
  is_spicy      INTEGER NOT NULL DEFAULT 0,
  is_available  INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_menu_items_restaurant ON menu_items (restaurant_id, is_available);
CREATE INDEX idx_menu_items_category ON menu_items (category_id);

CREATE TABLE featured_dishes (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         TEXT,
  image_url     TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_featured_restaurant ON featured_dishes (restaurant_id, is_active);

CREATE TABLE permanent_dishes (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         TEXT,
  category      TEXT,
  available     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_permanent_restaurant ON permanent_dishes (restaurant_id);

CREATE TABLE daily_specials (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         TEXT,
  category      TEXT,
  available     INTEGER NOT NULL DEFAULT 1,
  created_by    TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_daily_restaurant ON daily_specials (restaurant_id, available);

-- ---------------------------------------------------------------------------
-- Pedidos por mesa
-- ---------------------------------------------------------------------------
CREATE TABLE restaurant_tables (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number  INTEGER NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 4,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (restaurant_id, table_number)
);

CREATE TABLE table_orders (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id  TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number   TEXT NOT NULL UNIQUE,
  table_id       TEXT NOT NULL,
  total          REAL NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_orders_restaurant ON table_orders (restaurant_id, status, created_at);

CREATE TABLE table_order_items (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id    TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id         TEXT NOT NULL REFERENCES table_orders(id) ON DELETE CASCADE,
  item_id          TEXT NOT NULL,
  item_name        TEXT NOT NULL,
  item_description TEXT,
  item_price       TEXT NOT NULL,
  quantity         INTEGER NOT NULL DEFAULT 1,
  subtotal         REAL NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_order_items_order ON table_order_items (order_id);

CREATE TABLE kitchen_chat (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  sender_role   TEXT NOT NULL CHECK (sender_role IN ('waiter', 'chef')),
  sender_name   TEXT NOT NULL,
  message       TEXT NOT NULL,
  order_ref     TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_chat_restaurant ON kitchen_chat (restaurant_id, created_at);

CREATE TABLE waiters (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  pin           TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (restaurant_id, email),
  UNIQUE (restaurant_id, pin)
);

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------
CREATE TABLE customer_suggestions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  message         TEXT NOT NULL,
  rating          INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  suggestion_type TEXT NOT NULL DEFAULT 'general',
  is_read         INTEGER NOT NULL DEFAULT 0,
  is_replied      INTEGER NOT NULL DEFAULT 0,
  admin_notes     TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_suggestions_restaurant ON customer_suggestions (restaurant_id, created_at);

CREATE TABLE tiqueteras (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id    TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  cliente_nombre   TEXT NOT NULL,
  cliente_email    TEXT NOT NULL,
  cliente_telefono TEXT,
  comidas_total    INTEGER NOT NULL DEFAULT 30,
  comidas_usadas   INTEGER NOT NULL DEFAULT 0,
  activa           INTEGER NOT NULL DEFAULT 1,
  registrada_por   TEXT NOT NULL,
  notas            TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_tiqueteras_restaurant ON tiqueteras (restaurant_id, cliente_email);

CREATE TABLE tiquetera_movimientos (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id     TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  tiquetera_id      TEXT NOT NULL REFERENCES tiqueteras(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL CHECK (tipo IN ('descuento', 'recarga', 'anulacion')),
  cantidad          INTEGER NOT NULL DEFAULT 1,
  comidas_restantes INTEGER NOT NULL,
  registrado_por    TEXT NOT NULL,
  nota              TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_movimientos_tiquetera ON tiquetera_movimientos (tiquetera_id, created_at);

-- ---------------------------------------------------------------------------
-- Plato de la semana
-- ---------------------------------------------------------------------------
CREATE TABLE weekly_featured_dishes (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id       TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  item_id             TEXT NOT NULL,
  item_name           TEXT NOT NULL,
  item_description    TEXT,
  item_price          REAL NOT NULL,
  item_image          TEXT,
  week_start_date     TEXT NOT NULL,
  week_end_date       TEXT NOT NULL,
  total_orders        INTEGER NOT NULL,
  total_quantity_sold INTEGER NOT NULL,
  total_revenue       REAL NOT NULL,
  published_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_by        TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  win_count           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Una sola entrada ACTIVA por semana y restaurante (puede haber varias inactivas)
CREATE UNIQUE INDEX uq_weekly_active_week ON weekly_featured_dishes (restaurant_id, week_start_date) WHERE is_active = 1;
CREATE INDEX idx_weekly_restaurant ON weekly_featured_dishes (restaurant_id, published_at);
