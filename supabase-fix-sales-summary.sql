-- ===============================================
-- FIX para get_sales_summary
-- ===============================================
-- Corrige el error "column stats.item_id does not exist"
-- ===============================================

DROP FUNCTION IF EXISTS get_sales_summary(TEXT);

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
  WITH order_stats AS (
    SELECT
      COUNT(DISTINCT toi.order_id) as order_count,
      SUM(toi.quantity) as items_sold,
      SUM(toi.subtotal) as revenue,
      COUNT(DISTINCT toi.item_id) as unique_items
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
    SELECT
      toi.item_name,
      SUM(toi.quantity) as total_quantity
    FROM table_order_items toi
    JOIN table_orders to2 ON toi.order_id = to2.id
    WHERE to2.status != 'cancelled'
      AND (
        time_filter = 'all' OR
        (time_filter = 'today' AND to2.created_at >= DATE_TRUNC('day', NOW())) OR
        (time_filter = 'week' AND to2.created_at >= DATE_TRUNC('week', NOW())) OR
        (time_filter = 'month' AND to2.created_at >= DATE_TRUNC('month', NOW()))
      )
    GROUP BY toi.item_name
    ORDER BY total_quantity DESC
    LIMIT 1
  )
  SELECT
    os.order_count::BIGINT,
    os.items_sold::BIGINT,
    os.revenue::DECIMAL(10,2),
    os.unique_items::BIGINT,
    CASE
      WHEN os.order_count > 0 THEN ROUND(os.revenue / os.order_count, 2)::DECIMAL(10,2)
      ELSE 0::DECIMAL(10,2)
    END as avg_order_value,
    COALESCE(ti.item_name, 'N/A')::VARCHAR,
    COALESCE(ti.total_quantity, 0)::BIGINT
  FROM order_stats os
  LEFT JOIN top_item ti ON true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sales_summary(TEXT) IS 'Obtiene un resumen general de ventas para el período especificado (FIXED)';

-- Probar la función
SELECT * FROM get_sales_summary('month');
