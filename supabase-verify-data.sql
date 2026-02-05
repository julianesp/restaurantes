-- ===============================================
-- VERIFICAR DATOS EN LA BASE DE DATOS
-- ===============================================

-- 1. Ver cuántos items del menú hay
SELECT 'Total items en menú:' as descripcion, COUNT(*) as cantidad
FROM menu_items;

-- 2. Ver algunos items del menú
SELECT id, name, price, is_available
FROM menu_items
LIMIT 5;

-- 3. Ver cuántos pedidos hay
SELECT 'Total pedidos:' as descripcion, COUNT(*) as cantidad
FROM table_orders;

-- 4. Ver pedidos recientes
SELECT id, order_number, table_id, total, status, created_at
FROM table_orders
ORDER BY created_at DESC
LIMIT 5;

-- 5. Ver items pedidos
SELECT 'Total items pedidos:' as descripcion, COUNT(*) as cantidad
FROM table_order_items;

-- 6. Ver algunos items pedidos
SELECT
  toi.item_name,
  toi.quantity,
  toi.item_price,
  tor.created_at
FROM table_order_items toi
JOIN table_orders tor ON toi.order_id = tor.id
ORDER BY tor.created_at DESC
LIMIT 10;

-- 7. Probar si hay ganador de esta semana
SELECT * FROM get_current_week_winner();

-- 8. Ver platos ya publicados
SELECT
  item_name,
  week_start_date,
  week_end_date,
  total_quantity_sold,
  win_count,
  published_at
FROM weekly_featured_dishes
ORDER BY published_at DESC
LIMIT 5;
