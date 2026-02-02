-- Schema para sistema de pedidos de mesas
-- Ejecutar este SQL en el SQL Editor de Supabase

-- Tabla de mesas del restaurante
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos de mesas
CREATE TABLE IF NOT EXISTS table_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  table_id VARCHAR(50) NOT NULL, -- Puede ser el número de mesa como string
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, delivered, cancelled
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de pedidos
CREATE TABLE IF NOT EXISTS table_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES table_orders(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  item_description TEXT,
  item_price VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_table_orders_table_id ON table_orders(table_id);
CREATE INDEX IF NOT EXISTS idx_table_orders_status ON table_orders(status);
CREATE INDEX IF NOT EXISTS idx_table_orders_created_at ON table_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_order_items_order_id ON table_order_items(order_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_table_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_table_orders_updated_at_trigger ON table_orders;
CREATE TRIGGER update_table_orders_updated_at_trigger
BEFORE UPDATE ON table_orders
FOR EACH ROW EXECUTE FUNCTION update_table_orders_updated_at();

DROP TRIGGER IF EXISTS update_restaurant_tables_updated_at_trigger ON restaurant_tables;
CREATE TRIGGER update_restaurant_tables_updated_at_trigger
BEFORE UPDATE ON restaurant_tables
FOR EACH ROW EXECUTE FUNCTION update_table_orders_updated_at();

-- Políticas de seguridad Row Level Security (RLS)
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_order_items ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer mesas activas (para generar QRs)
DROP POLICY IF EXISTS "Permitir lectura pública de mesas" ON restaurant_tables;
CREATE POLICY "Permitir lectura pública de mesas"
ON restaurant_tables FOR SELECT
USING (is_active = true);

-- Política: Permitir inserción pública de pedidos (los clientes pueden hacer pedidos)
DROP POLICY IF EXISTS "Permitir creación pública de pedidos" ON table_orders;
CREATE POLICY "Permitir creación pública de pedidos"
ON table_orders FOR INSERT
WITH CHECK (true);

-- Política: Permitir lectura pública de pedidos
DROP POLICY IF EXISTS "Permitir lectura pública de pedidos" ON table_orders;
CREATE POLICY "Permitir lectura pública de pedidos"
ON table_orders FOR SELECT
USING (true);

-- Política: Permitir actualización pública de pedidos (para cambiar estado)
DROP POLICY IF EXISTS "Permitir actualización pública de pedidos" ON table_orders;
CREATE POLICY "Permitir actualización pública de pedidos"
ON table_orders FOR UPDATE
USING (true);

-- Política: Permitir inserción pública de items de pedidos
DROP POLICY IF EXISTS "Permitir creación pública de items" ON table_order_items;
CREATE POLICY "Permitir creación pública de items"
ON table_order_items FOR INSERT
WITH CHECK (true);

-- Política: Permitir lectura pública de items
DROP POLICY IF EXISTS "Permitir lectura pública de items" ON table_order_items;
CREATE POLICY "Permitir lectura pública de items"
ON table_order_items FOR SELECT
USING (true);

-- Insertar algunas mesas de ejemplo (opcional)
INSERT INTO restaurant_tables (table_number, capacity)
VALUES
  (1, 4),
  (2, 4),
  (3, 2),
  (4, 6),
  (5, 4),
  (6, 4),
  (7, 2),
  (8, 6),
  (9, 4),
  (10, 4)
ON CONFLICT (table_number) DO NOTHING;

-- Vista para obtener pedidos con sus items (útil para consultas)
CREATE OR REPLACE VIEW order_details AS
SELECT
  o.id as order_id,
  o.order_number,
  o.table_id,
  o.total,
  o.status,
  o.customer_notes,
  o.created_at,
  o.updated_at,
  json_agg(
    json_build_object(
      'id', i.id,
      'item_id', i.item_id,
      'item_name', i.item_name,
      'item_description', i.item_description,
      'item_price', i.item_price,
      'quantity', i.quantity,
      'subtotal', i.subtotal
    )
  ) as items
FROM table_orders o
LEFT JOIN table_order_items i ON o.id = i.order_id
GROUP BY o.id, o.order_number, o.table_id, o.total, o.status, o.customer_notes, o.created_at, o.updated_at;
