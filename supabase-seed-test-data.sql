-- ===============================================
-- CREAR DATOS DE PRUEBA
-- ===============================================
-- Este script crea datos de ejemplo para probar
-- el sistema de estadísticas y plato de la semana
-- ===============================================

-- IMPORTANTE: Solo ejecuta esto si NO tienes datos reales
-- o si quieres datos de prueba adicionales

-- 0. LIMPIAR DATOS ANTERIORES DE PRUEBA
-- Elimina cualquier dato de prueba previo para evitar conflictos
DELETE FROM table_order_items
WHERE order_id IN (SELECT id FROM table_orders WHERE order_number LIKE 'ORDER-TEST-%');

DELETE FROM table_orders WHERE order_number LIKE 'ORDER-TEST-%';

DELETE FROM restaurant_tables WHERE table_number = 99;

-- 1. Crear mesa de prueba si no existe
INSERT INTO restaurant_tables (table_number, capacity, is_active)
VALUES (99, 4, true)
ON CONFLICT (table_number) DO NOTHING;

-- 2. Obtener el ID de la mesa
DO $$
DECLARE
  v_table_id VARCHAR;
  v_order_id UUID;
  i INTEGER;
BEGIN
  -- Obtener ID de la mesa de prueba
  SELECT id INTO v_table_id FROM restaurant_tables WHERE table_number = 99;

  -- Crear 10 pedidos de prueba de esta semana
  FOR i IN 1..10 LOOP
    -- Crear pedido
    INSERT INTO table_orders (
      order_number,
      table_id,
      total,
      status,
      customer_notes,
      created_at,
      updated_at
    ) VALUES (
      'ORDER-TEST-' || i,
      v_table_id,
      50000,
      'delivered',
      'Pedido de prueba',
      DATE_TRUNC('week', NOW()) + (i || ' hours')::INTERVAL,
      DATE_TRUNC('week', NOW()) + (i || ' hours')::INTERVAL
    )
    RETURNING id INTO v_order_id;

    -- Agregar items al pedido
    -- Bandeja Paisa (el más pedido)
    IF i <= 7 THEN
      INSERT INTO table_order_items (
        order_id,
        item_id,
        item_name,
        item_description,
        item_price,
        quantity,
        subtotal
      ) VALUES (
        v_order_id,
        'bandeja-paisa-001',
        'Bandeja Paisa Especial',
        'Deliciosa bandeja paisa con todos los acompañamientos tradicionales',
        32000,
        2,
        64000
      );
    END IF;

    -- Ajiaco (segundo más pedido)
    IF i <= 5 THEN
      INSERT INTO table_order_items (
        order_id,
        item_id,
        item_name,
        item_description,
        item_price,
        quantity,
        subtotal
      ) VALUES (
        v_order_id,
        'ajiaco-001',
        'Ajiaco Santafereño',
        'Tradicional ajiaco con papa criolla, guascas y mazorca',
        25000,
        1,
        25000
      );
    END IF;

    -- Sancocho (tercero)
    IF i <= 3 THEN
      INSERT INTO table_order_items (
        order_id,
        item_id,
        item_name,
        item_description,
        item_price,
        quantity,
        subtotal
      ) VALUES (
        v_order_id,
        'sancocho-001',
        'Sancocho de Gallina',
        'Sancocho tradicional con gallina criolla y vegetales',
        28000,
        1,
        28000
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Datos de prueba creados exitosamente';
END $$;

-- 3. Verificar los datos creados
SELECT 'Pedidos de prueba creados:' as descripcion, COUNT(*) as cantidad
FROM table_orders
WHERE order_number LIKE 'ORDER-TEST-%';

SELECT 'Items de prueba creados:' as descripcion, COUNT(*) as cantidad
FROM table_order_items toi
JOIN table_orders tor ON toi.order_id = tor.id
WHERE tor.order_number LIKE 'ORDER-TEST-%';

-- 4. Ver el ganador de la semana con los datos de prueba
SELECT
  item_name,
  SUM(quantity) as total_vendido
FROM table_order_items toi
JOIN table_orders tor ON toi.order_id = tor.id
WHERE tor.created_at >= DATE_TRUNC('week', NOW())
  AND tor.status != 'cancelled'
GROUP BY item_name
ORDER BY total_vendido DESC
LIMIT 5;

-- 5. Probar la función de ganador
SELECT * FROM get_current_week_winner();

-- ===============================================
-- LIMPIAR DATOS DE PRUEBA (si es necesario)
-- ===============================================

-- Descomenta para eliminar los datos de prueba:
-- DELETE FROM table_order_items
-- WHERE order_id IN (SELECT id FROM table_orders WHERE order_number LIKE 'ORDER-TEST-%');
--
-- DELETE FROM table_orders WHERE order_number LIKE 'ORDER-TEST-%';
--
-- DELETE FROM restaurant_tables WHERE table_number = 99;
