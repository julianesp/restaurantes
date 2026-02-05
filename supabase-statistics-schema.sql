-- ===============================================
-- SCHEMA PARA ESTADÍSTICAS DE PLATOS MÁS PEDIDOS
-- ===============================================
-- Este archivo crea vistas y funciones para obtener
-- estadísticas de los platos más vendidos con filtros
-- de tiempo (diario, semanal, mensual, total)
-- ===============================================

-- Vista para estadísticas generales de items pedidos
CREATE OR REPLACE VIEW item_statistics AS
SELECT
  toi.item_id,
  toi.item_name,
  toi.item_description,
  CAST(toi.item_price AS DECIMAL(10,2)) as item_price,
  COUNT(toi.id) as order_count,
  SUM(toi.quantity) as total_quantity_sold,
  SUM(toi.subtotal) as total_revenue,
  MIN(to2.created_at) as first_ordered_at,
  MAX(to2.created_at) as last_ordered_at,
  -- Promedio de unidades por pedido
  ROUND(AVG(toi.quantity), 2) as avg_quantity_per_order
FROM
  table_order_items toi
JOIN
  table_orders to2 ON toi.order_id = to2.id
WHERE
  to2.status != 'cancelled'  -- Excluir pedidos cancelados
GROUP BY
  toi.item_id,
  toi.item_name,
  toi.item_description,
  toi.item_price
ORDER BY
  total_quantity_sold DESC;

-- Comentario en la vista
COMMENT ON VIEW item_statistics IS 'Vista con estadísticas agregadas de todos los items pedidos (excluyendo cancelados)';

-- ===============================================
-- FUNCIÓN: Estadísticas de platos con filtro de tiempo
-- ===============================================
-- Parámetros:
--   time_filter: 'today' | 'week' | 'month' | 'all'
-- Retorna: Tabla con estadísticas filtradas por período
-- ===============================================

CREATE OR REPLACE FUNCTION get_item_statistics(time_filter TEXT DEFAULT 'all')
RETURNS TABLE (
  item_id VARCHAR,
  item_name VARCHAR,
  item_description TEXT,
  item_price DECIMAL(10,2),
  order_count BIGINT,
  total_quantity_sold BIGINT,
  total_revenue DECIMAL(10,2),
  first_ordered_at TIMESTAMPTZ,
  last_ordered_at TIMESTAMPTZ,
  avg_quantity_per_order NUMERIC
) AS $$
DECLARE
  date_threshold TIMESTAMPTZ;
BEGIN
  -- Determinar la fecha límite según el filtro
  CASE time_filter
    WHEN 'today' THEN
      date_threshold := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN
      date_threshold := DATE_TRUNC('week', NOW());
    WHEN 'month' THEN
      date_threshold := DATE_TRUNC('month', NOW());
    ELSE
      date_threshold := '1900-01-01'::TIMESTAMPTZ; -- Sin filtro, todos los registros
  END CASE;

  -- Retornar estadísticas filtradas
  RETURN QUERY
  SELECT
    toi.item_id,
    toi.item_name,
    toi.item_description,
    CAST(toi.item_price AS DECIMAL(10,2)) as item_price,
    COUNT(toi.id)::BIGINT as order_count,
    SUM(toi.quantity)::BIGINT as total_quantity_sold,
    SUM(toi.subtotal)::DECIMAL(10,2) as total_revenue,
    MIN(to2.created_at) as first_ordered_at,
    MAX(to2.created_at) as last_ordered_at,
    ROUND(AVG(toi.quantity), 2) as avg_quantity_per_order
  FROM
    table_order_items toi
  JOIN
    table_orders to2 ON toi.order_id = to2.id
  WHERE
    to2.status != 'cancelled'  -- Excluir cancelados
    AND to2.created_at >= date_threshold
  GROUP BY
    toi.item_id,
    toi.item_name,
    toi.item_description,
    toi.item_price
  ORDER BY
    total_quantity_sold DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentario en la función
COMMENT ON FUNCTION get_item_statistics(TEXT) IS 'Obtiene estadísticas de items con filtro de tiempo: today, week, month, all';

-- ===============================================
-- FUNCIÓN: Top N platos más pedidos
-- ===============================================
-- Parámetros:
--   time_filter: 'today' | 'week' | 'month' | 'all'
--   limit_count: Número de platos a retornar (default: 10)
-- Retorna: Top N platos más vendidos
-- ===============================================

CREATE OR REPLACE FUNCTION get_top_items(time_filter TEXT DEFAULT 'all', limit_count INT DEFAULT 10)
RETURNS TABLE (
  item_id VARCHAR,
  item_name VARCHAR,
  item_description TEXT,
  item_price DECIMAL(10,2),
  order_count BIGINT,
  total_quantity_sold BIGINT,
  total_revenue DECIMAL(10,2),
  rank_position BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    stats.item_id,
    stats.item_name,
    stats.item_description,
    stats.item_price,
    stats.order_count,
    stats.total_quantity_sold,
    stats.total_revenue,
    ROW_NUMBER() OVER (ORDER BY stats.total_quantity_sold DESC) as rank_position
  FROM
    get_item_statistics(time_filter) stats
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Comentario en la función
COMMENT ON FUNCTION get_top_items(TEXT, INT) IS 'Obtiene el top N de items más vendidos con filtro de tiempo';

-- ===============================================
-- FUNCIÓN: Estadísticas de ventas por período
-- ===============================================
-- Obtiene un resumen general de ventas por el período especificado
-- ===============================================

CREATE OR REPLACE FUNCTION get_sales_summary(time_filter TEXT DEFAULT 'all')
RETURNS TABLE (
  total_orders BIGINT,
  total_items_sold BIGINT,
  total_revenue DECIMAL(10,2),
  unique_items_count BIGINT,
  avg_order_value DECIMAL(10,2),
  most_popular_item VARCHAR,
  most_popular_item_quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT * FROM get_item_statistics(time_filter)
  ),
  order_stats AS (
    SELECT
      COUNT(DISTINCT toi.order_id) as order_count,
      SUM(toi.quantity) as items_sold,
      SUM(toi.subtotal) as revenue
    FROM table_order_items toi
    JOIN table_orders to2 ON toi.order_id = to2.id
    WHERE to2.status != 'cancelled'
      AND (
        time_filter = 'all' OR
        (time_filter = 'today' AND to2.created_at >= DATE_TRUNC('day', NOW())) OR
        (time_filter = 'week' AND to2.created_at >= DATE_TRUNC('week', NOW())) OR
        (time_filter = 'month' AND to2.created_at >= DATE_TRUNC('month', NOW()))
      )
  ),
  top_item AS (
    SELECT item_name, total_quantity_sold
    FROM stats
    ORDER BY total_quantity_sold DESC
    LIMIT 1
  )
  SELECT
    os.order_count::BIGINT,
    os.items_sold::BIGINT,
    os.revenue::DECIMAL(10,2),
    COUNT(stats.item_id)::BIGINT as unique_items,
    CASE
      WHEN os.order_count > 0 THEN ROUND(os.revenue / os.order_count, 2)::DECIMAL(10,2)
      ELSE 0::DECIMAL(10,2)
    END as avg_order_value,
    COALESCE(ti.item_name, 'N/A')::VARCHAR,
    COALESCE(ti.total_quantity_sold, 0)::BIGINT
  FROM order_stats os
  CROSS JOIN (SELECT COUNT(*) FROM stats) as stats
  LEFT JOIN top_item ti ON true
  GROUP BY os.order_count, os.items_sold, os.revenue, ti.item_name, ti.total_quantity_sold;
END;
$$ LANGUAGE plpgsql;

-- Comentario en la función
COMMENT ON FUNCTION get_sales_summary(TEXT) IS 'Obtiene un resumen general de ventas para el período especificado';

-- ===============================================
-- ÍNDICES para mejorar performance
-- ===============================================

-- Índice en created_at para queries de filtro por fecha
CREATE INDEX IF NOT EXISTS idx_table_orders_created_at
ON table_orders(created_at);

-- Índice en status para filtrado de cancelados
CREATE INDEX IF NOT EXISTS idx_table_orders_status
ON table_orders(status);

-- Índice compuesto para queries comunes
CREATE INDEX IF NOT EXISTS idx_table_orders_status_created
ON table_orders(status, created_at);

-- Índice en item_id para agregaciones
CREATE INDEX IF NOT EXISTS idx_table_order_items_item_id
ON table_order_items(item_id);

-- ===============================================
-- PERMISOS (ajustar según necesidades)
-- ===============================================

-- Otorgar permisos de SELECT a usuarios autenticados
-- GRANT SELECT ON item_statistics TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_item_statistics(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_top_items(TEXT, INT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_sales_summary(TEXT) TO authenticated;

-- ===============================================
-- EJEMPLOS DE USO
-- ===============================================

-- Ver todas las estadísticas de items
-- SELECT * FROM item_statistics;

-- Ver estadísticas del mes actual
-- SELECT * FROM get_item_statistics('month');

-- Ver estadísticas de la semana actual
-- SELECT * FROM get_item_statistics('week');

-- Ver estadísticas de hoy
-- SELECT * FROM get_item_statistics('today');

-- Ver top 5 platos más pedidos del mes
-- SELECT * FROM get_top_items('month', 5);

-- Ver resumen de ventas mensual
-- SELECT * FROM get_sales_summary('month');
