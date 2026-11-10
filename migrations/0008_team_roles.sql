-- Equipo con correo: roles "mesero" (waiter) y "chef" en restaurant_members, para que cada persona
-- entre con su propia cuenta (correo verificado) sin compartir la del dueño.
-- Los meseros con PIN (tabla waiters) siguen funcionando igual.

-- SQLite no permite cambiar un CHECK: se reconstruye la tabla (ninguna otra tabla la referencia).
CREATE TABLE restaurant_members_new (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'waiter', 'chef')),
  -- Nombre para mostrar (meseros y chefs; dueños y administradores lo toman de su cuenta)
  name          TEXT,
  -- Un mesero o chef desactivado conserva su fila pero no puede entrar
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (restaurant_id, email)
);
INSERT INTO restaurant_members_new (id, restaurant_id, email, role, created_at)
  SELECT id, restaurant_id, email, role, created_at FROM restaurant_members;
DROP TABLE restaurant_members;
ALTER TABLE restaurant_members_new RENAME TO restaurant_members;
CREATE INDEX idx_members_email ON restaurant_members (email);

-- Quién tomó cada pedido de mesa (el mesero ve los suyos y se entera cuando están listos)
ALTER TABLE table_orders ADD COLUMN waiter_name TEXT;
ALTER TABLE table_orders ADD COLUMN waiter_email TEXT;
CREATE INDEX idx_orders_waiter ON table_orders (restaurant_id, waiter_email, status);
