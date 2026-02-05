-- ===============================================
-- VERIFICAR DATOS DE LA SEMANA ACTUAL
-- ===============================================

-- 1. Ver fecha de inicio y fin de semana actual
SELECT
  DATE_TRUNC('week', NOW())::DATE as semana_inicio,
  (DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::DATE as semana_fin;

-- 2. Contar pedidos de esta semana
SELECT COUNT(*) as pedidos_esta_semana
FROM table_orders
WHERE created_at >= DATE_TRUNC('week', NOW())
  AND status != 'cancelled';

-- 3. Ver platos pedidos esta semana
SELECT
  toi.item_name,
  COUNT(*) as veces_pedido,
  SUM(toi.quantity) as unidades_vendidas
FROM table_order_items toi
JOIN table_orders tor ON toi.order_id = tor.id
WHERE tor.created_at >= DATE_TRUNC('week', NOW())
  AND tor.status != 'cancelled'
GROUP BY toi.item_name
ORDER BY unidades_vendidas DESC
LIMIT 5;

-- 4. Probar función de ganador de la semana
SELECT * FROM get_current_week_winner();

-- 5. Ver si hay algún plato ya publicado
SELECT * FROM weekly_featured_dishes
ORDER BY published_at DESC
LIMIT 5;
