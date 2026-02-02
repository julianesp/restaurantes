-- Tabla de categorías del menú
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del menú
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price VARCHAR(50) NOT NULL,
  is_vegetarian BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_categories_active ON menu_categories(is_active);
CREATE INDEX idx_menu_categories_order ON menu_categories(display_order);
CREATE INDEX idx_menu_items_order ON menu_items(display_order);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad Row Level Security (RLS)
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer categorías activas
CREATE POLICY "Permitir lectura pública de categorías activas"
ON menu_categories FOR SELECT
USING (is_active = true);

-- Política: Todos pueden leer items disponibles
CREATE POLICY "Permitir lectura pública de items disponibles"
ON menu_items FOR SELECT
USING (is_available = true);

-- Nota: Las políticas de escritura (INSERT, UPDATE, DELETE) deben manejarse
-- a través del service role key en el backend para mayor seguridad.
-- No se crean políticas públicas de escritura para proteger los datos.
