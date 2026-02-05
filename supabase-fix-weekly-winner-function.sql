-- ===============================================
-- FIX: Actualizar función get_current_week_winner()
-- ===============================================
-- Este script corrige la función para manejar
-- item_price como VARCHAR con formato de moneda
-- ===============================================

-- Eliminar la función existente
DROP FUNCTION IF EXISTS get_current_week_winner();

-- Recrear la función con la conversión correcta de precios
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

-- Comentario
COMMENT ON FUNCTION get_current_week_winner() IS 'Obtiene el plato más vendido de la semana actual con conversión correcta de precios VARCHAR a DECIMAL';

-- Verificar que funciona
SELECT * FROM get_current_week_winner();
