-- ===============================================
-- CREAR PLATO DE PRUEBA PARA LA SEMANA
-- ===============================================
-- Usa esto SOLO si no tienes pedidos reales esta semana
-- ===============================================

-- Publicar un plato de ejemplo manualmente
SELECT publish_weekly_winner(
  'test_001'::VARCHAR,                                    -- item_id
  'Bandeja Paisa Especial'::VARCHAR,                     -- item_name
  'Deliciosa bandeja paisa con todos los acompañamientos tradicionales. El favorito de nuestros clientes.'::TEXT, -- item_description
  32000::DECIMAL(10,2),                                   -- item_price
  45::INTEGER,                                            -- total_orders
  67::INTEGER,                                            -- total_quantity_sold
  2144000::DECIMAL(10,2),                                 -- total_revenue
  DATE_TRUNC('week', NOW())::DATE,                        -- week_start_date
  (DATE_TRUNC('week', NOW()) + INTERVAL '6 days')::DATE, -- week_end_date
  NULL::VARCHAR,                                          -- item_image (puedes agregar una URL después)
  'admin'::VARCHAR                                        -- published_by
);

-- Verificar que se creó
SELECT * FROM get_current_featured_dish();
