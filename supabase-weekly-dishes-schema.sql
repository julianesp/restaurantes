-- ===============================================
-- SCHEMA PARA PLATOS DE LA SEMANA DESTACADOS
-- ===============================================
-- Este archivo crea la tabla y funciones para gestionar
-- los platos ganadores de cada semana basados en estadísticas
-- ===============================================

-- Tabla para almacenar historial de platos de la semana
CREATE TABLE IF NOT EXISTS weekly_featured_dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información del plato
  item_id VARCHAR NOT NULL,
  item_name VARCHAR NOT NULL,
  item_description TEXT,
  item_price DECIMAL(10,2) NOT NULL,
  item_image VARCHAR,

  -- Estadísticas de la semana ganadora
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_orders INTEGER NOT NULL,
  total_quantity_sold INTEGER NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,

  -- Metadatos
  published_at TIMESTAMPTZ DEFAULT NOW(),
  published_by VARCHAR,
  is_active BOOLEAN DEFAULT true,

  -- Control de repeticiones (cuántas veces ha ganado)
  win_count INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Restricción: una sola entrada activa por semana
  CONSTRAINT unique_active_week UNIQUE (week_start_date, is_active)
);

-- Comentario en la tabla
COMMENT ON TABLE weekly_featured_dishes IS 'Historial de platos ganadores de cada semana basados en estadísticas de ventas';

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_weekly_dishes_week_start ON weekly_featured_dishes(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_dishes_item_id ON weekly_featured_dishes(item_id);
CREATE INDEX IF NOT EXISTS idx_weekly_dishes_active ON weekly_featured_dishes(is_active, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_dishes_published ON weekly_featured_dishes(published_at DESC);

-- ===============================================
-- FUNCIÓN: Obtener plato ganador de la semana
-- ===============================================
-- Retorna el plato más vendido de la semana actual
-- basándose en las estadísticas de pedidos
-- ===============================================

CREATE OR REPLACE FUNCTION get_current_week_winner()
RETURNS TABLE (
  item_id VARCHAR,
  item_name VARCHAR,
  item_description TEXT,
  item_price DECIMAL(10,2),
  total_orders BIGINT,
  total_quantity_sold BIGINT,
  total_revenue DECIMAL(10,2),
  week_start DATE,
  week_end DATE
) AS $$
DECLARE
  week_start DATE;
  week_end DATE;
BEGIN
  -- Calcular inicio y fin de la semana actual (lunes a domingo)
  week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end := (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE;

  -- Obtener el plato más vendido de la semana
  RETURN QUERY
  SELECT
    toi.item_id,
    toi.item_name,
    toi.item_description,
    CAST(
      REGEXP_REPLACE(
        REPLACE(REPLACE(toi.item_price, '$', ''), '.', ''),
        '[^0-9]',
        '',
        'g'
      ) AS DECIMAL(10,2)
    ) as item_price,
    COUNT(DISTINCT toi.order_id)::BIGINT as total_orders,
    SUM(toi.quantity)::BIGINT as total_quantity_sold,
    SUM(toi.subtotal)::DECIMAL(10,2) as total_revenue,
    week_start,
    week_end
  FROM
    table_order_items toi
  JOIN
    table_orders tor ON toi.order_id = tor.id
  WHERE
    tor.status != 'cancelled'
    AND tor.created_at >= week_start
    AND tor.created_at < (week_end + INTERVAL '1 day')
  GROUP BY
    toi.item_id,
    toi.item_name,
    toi.item_description,
    toi.item_price
  ORDER BY
    total_quantity_sold DESC,
    total_revenue DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_current_week_winner() IS 'Obtiene el plato más vendido de la semana actual';

-- ===============================================
-- FUNCIÓN: Publicar plato de la semana
-- ===============================================
-- Publica el plato ganador de la semana en la galería
-- Si el plato ya ganó antes, incrementa el contador
-- ===============================================

CREATE OR REPLACE FUNCTION publish_weekly_winner(
  p_item_id VARCHAR,
  p_item_name VARCHAR,
  p_item_description TEXT,
  p_item_price DECIMAL(10,2),
  p_total_orders INTEGER,
  p_total_quantity_sold INTEGER,
  p_total_revenue DECIMAL(10,2),
  p_week_start_date DATE,
  p_week_end_date DATE,
  p_item_image VARCHAR DEFAULT NULL,
  p_published_by VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_id UUID;
  v_previous_wins INTEGER;
BEGIN
  -- Contar cuántas veces este plato ha ganado antes
  SELECT COUNT(*)
  INTO v_previous_wins
  FROM weekly_featured_dishes
  WHERE item_id = p_item_id;

  -- Desactivar cualquier entrada activa de la misma semana
  UPDATE weekly_featured_dishes
  SET is_active = false
  WHERE week_start_date = p_week_start_date
    AND is_active = true;

  -- Insertar el nuevo ganador
  INSERT INTO weekly_featured_dishes (
    item_id,
    item_name,
    item_description,
    item_price,
    item_image,
    week_start_date,
    week_end_date,
    total_orders,
    total_quantity_sold,
    total_revenue,
    published_by,
    win_count,
    is_active
  ) VALUES (
    p_item_id,
    p_item_name,
    p_item_description,
    p_item_price,
    p_item_image,
    p_week_start_date,
    p_week_end_date,
    p_total_orders,
    p_total_quantity_sold,
    p_total_revenue,
    p_published_by,
    v_previous_wins + 1,
    true
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION publish_weekly_winner IS 'Publica el plato ganador de la semana, incrementando contador si ya ganó antes';

-- ===============================================
-- FUNCIÓN: Obtener historial de platos destacados
-- ===============================================
-- Retorna el historial de platos ganadores ordenado por fecha
-- Con límite opcional
-- ===============================================

CREATE OR REPLACE FUNCTION get_featured_dishes_history(
  limit_count INTEGER DEFAULT 20,
  only_active BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  item_id VARCHAR,
  item_name VARCHAR,
  item_description TEXT,
  item_price DECIMAL(10,2),
  item_image VARCHAR,
  week_start_date DATE,
  week_end_date DATE,
  total_orders INTEGER,
  total_quantity_sold INTEGER,
  total_revenue DECIMAL(10,2),
  win_count INTEGER,
  is_active BOOLEAN,
  published_at TIMESTAMPTZ,
  published_by VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wfd.id,
    wfd.item_id,
    wfd.item_name,
    wfd.item_description,
    wfd.item_price,
    wfd.item_image,
    wfd.week_start_date,
    wfd.week_end_date,
    wfd.total_orders,
    wfd.total_quantity_sold,
    wfd.total_revenue,
    wfd.win_count,
    wfd.is_active,
    wfd.published_at,
    wfd.published_by
  FROM
    weekly_featured_dishes wfd
  WHERE
    (NOT only_active OR wfd.is_active = true)
  ORDER BY
    wfd.week_start_date DESC,
    wfd.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_featured_dishes_history IS 'Obtiene el historial de platos destacados de la semana';

-- ===============================================
-- FUNCIÓN: Obtener plato activo actual
-- ===============================================
-- Retorna el plato destacado que está actualmente activo
-- ===============================================

CREATE OR REPLACE FUNCTION get_current_featured_dish()
RETURNS TABLE (
  id UUID,
  item_id VARCHAR,
  item_name VARCHAR,
  item_description TEXT,
  item_price DECIMAL(10,2),
  item_image VARCHAR,
  week_start_date DATE,
  week_end_date DATE,
  total_orders INTEGER,
  total_quantity_sold INTEGER,
  total_revenue DECIMAL(10,2),
  win_count INTEGER,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wfd.id,
    wfd.item_id,
    wfd.item_name,
    wfd.item_description,
    wfd.item_price,
    wfd.item_image,
    wfd.week_start_date,
    wfd.week_end_date,
    wfd.total_orders,
    wfd.total_quantity_sold,
    wfd.total_revenue,
    wfd.win_count,
    wfd.published_at
  FROM
    weekly_featured_dishes wfd
  WHERE
    wfd.is_active = true
  ORDER BY
    wfd.published_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_current_featured_dish() IS 'Obtiene el plato destacado actualmente activo';

-- ===============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ===============================================

CREATE OR REPLACE FUNCTION update_weekly_dishes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_dishes_updated_at
BEFORE UPDATE ON weekly_featured_dishes
FOR EACH ROW
EXECUTE FUNCTION update_weekly_dishes_updated_at();

-- ===============================================
-- DATOS DE EJEMPLO (comentados, descomentar si necesitas)
-- ===============================================

-- INSERT INTO weekly_featured_dishes (
--   item_id,
--   item_name,
--   item_description,
--   item_price,
--   week_start_date,
--   week_end_date,
--   total_orders,
--   total_quantity_sold,
--   total_revenue,
--   win_count
-- ) VALUES (
--   'item_001',
--   'Plato Ejemplo',
--   'Descripción del plato ejemplo',
--   25000,
--   '2025-01-27',
--   '2025-02-02',
--   45,
--   67,
--   1675000,
--   1
-- );

-- ===============================================
-- EJEMPLOS DE USO
-- ===============================================

-- Obtener ganador de la semana actual
-- SELECT * FROM get_current_week_winner();

-- Publicar ganador manualmente
-- SELECT publish_weekly_winner(
--   'item_123',
--   'Bandeja Paisa',
--   'Deliciosa bandeja paisa tradicional',
--   32000,
--   'https://example.com/image.jpg',
--   45,
--   67,
--   2144000,
--   '2025-02-03',
--   '2025-02-09',
--   'admin@example.com'
-- );

-- Ver historial completo
-- SELECT * FROM get_featured_dishes_history(10, false);

-- Ver solo plato activo
-- SELECT * FROM get_current_featured_dish();
