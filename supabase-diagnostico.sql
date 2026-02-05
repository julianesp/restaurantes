-- ===============================================
-- SCRIPT DE DIAGNÓSTICO
-- ===============================================
-- Ejecuta este script en Supabase SQL Editor
-- para verificar el estado de las tablas y funciones
-- ===============================================

-- 1. Verificar que las tablas existen
SELECT 'Tabla table_orders existe:' as check_name,
       EXISTS (SELECT FROM information_schema.tables
               WHERE table_name = 'table_orders') as result;

SELECT 'Tabla table_order_items existe:' as check_name,
       EXISTS (SELECT FROM information_schema.tables
               WHERE table_name = 'table_order_items') as result;

-- 2. Ver estructura de las tablas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'table_order_items'
ORDER BY ordinal_position;

-- 3. Contar registros
SELECT 'Total pedidos:' as descripcion, COUNT(*) as cantidad FROM table_orders;
SELECT 'Total items:' as descripcion, COUNT(*) as cantidad FROM table_order_items;
SELECT 'Pedidos no cancelados:' as descripcion, COUNT(*) as cantidad
FROM table_orders WHERE status != 'cancelled';

-- 4. Ver datos de ejemplo
SELECT * FROM table_order_items LIMIT 3;
SELECT * FROM table_orders LIMIT 3;

-- 5. Probar la consulta básica que usa la función
SELECT
  toi.item_id,
  toi.item_name,
  toi.item_description,
  CAST(toi.item_price AS DECIMAL(10,2)) as item_price,
  COUNT(toi.id) as order_count,
  SUM(toi.quantity) as total_quantity_sold,
  SUM(toi.subtotal) as total_revenue
FROM
  table_order_items toi
JOIN
  table_orders to2 ON toi.order_id = to2.id
WHERE
  to2.status != 'cancelled'
GROUP BY
  toi.item_id,
  toi.item_name,
  toi.item_description,
  toi.item_price
ORDER BY
  total_quantity_sold DESC
LIMIT 5;

-- 6. Verificar las funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%statistics%' OR routine_name LIKE '%weekly%')
ORDER BY routine_name;

-- 7. Probar función simple
SELECT * FROM get_item_statistics('all') LIMIT 1;
