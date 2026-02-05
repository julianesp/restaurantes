-- ===============================================
-- AUTOMATIZACIÓN DE PUBLICACIÓN SEMANAL
-- ===============================================
-- Este script configura la publicación automática
-- del plato ganador cada lunes a las 00:00
-- ===============================================

-- Paso 1: Habilitar extensión pg_cron (si no está habilitada)
-- IMPORTANTE: Esto debe ejecutarse como superusuario
-- Si no tienes permisos, contacta a soporte de Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===============================================
-- FUNCIÓN: Publicar automáticamente el ganador
-- ===============================================

CREATE OR REPLACE FUNCTION auto_publish_weekly_winner()
RETURNS void AS $$
DECLARE
  v_winner RECORD;
  v_week_start DATE;
  v_week_end DATE;
  v_new_id UUID;
BEGIN
  -- Calcular semana anterior (lunes a domingo)
  v_week_start := (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days')::DATE;
  v_week_end := (v_week_start + INTERVAL '6 days')::DATE;

  -- Obtener el ganador de la semana anterior
  SELECT
    toi.item_id,
    toi.item_name,
    toi.item_description,
    -- Convertir VARCHAR a número
    CAST(
      REGEXP_REPLACE(
        REPLACE(REPLACE(toi.item_price, '$', ''), '.', ''),
        '[^0-9]',
        '',
        'g'
      ) AS DECIMAL(10,2)
    ) as item_price,
    COUNT(DISTINCT toi.order_id)::INTEGER as total_orders,
    SUM(toi.quantity)::INTEGER as total_quantity_sold,
    SUM(toi.subtotal)::DECIMAL(10,2) as total_revenue
  INTO v_winner
  FROM
    table_order_items toi
  JOIN
    table_orders tor ON toi.order_id = tor.id
  WHERE
    tor.status != 'cancelled'
    AND tor.created_at >= v_week_start
    AND tor.created_at < (v_week_end + INTERVAL '1 day')
  GROUP BY
    toi.item_id,
    toi.item_name,
    toi.item_description,
    toi.item_price
  ORDER BY
    SUM(toi.quantity) DESC,
    SUM(toi.subtotal) DESC
  LIMIT 1;

  -- Si hay un ganador, publicarlo
  IF v_winner.item_id IS NOT NULL THEN
    v_new_id := publish_weekly_winner(
      v_winner.item_id,
      v_winner.item_name,
      COALESCE(v_winner.item_description, ''),
      v_winner.item_price,
      v_winner.total_orders,
      v_winner.total_quantity_sold,
      v_winner.total_revenue,
      v_week_start,
      v_week_end,
      NULL, -- item_image
      'system-auto' -- published_by
    );

    RAISE NOTICE 'Plato publicado automáticamente: % (ID: %)', v_winner.item_name, v_new_id;
  ELSE
    RAISE NOTICE 'No hay datos de ventas para la semana % - %', v_week_start, v_week_end;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_publish_weekly_winner() IS 'Publica automáticamente el plato ganador de la semana anterior cada lunes';

-- ===============================================
-- CONFIGURAR CRON JOB
-- ===============================================
-- Se ejecuta cada lunes a las 00:05 (5 minutos después de medianoche)
-- Timezone: UTC (ajusta según tu zona horaria)

-- Primero, eliminar job anterior si existe
SELECT cron.unschedule('auto-publish-weekly-winner');

-- Crear el cron job
-- Cron schedule: '5 0 * * 1' = minuto 5, hora 0, cualquier día del mes, cualquier mes, lunes (1)
SELECT cron.schedule(
  'auto-publish-weekly-winner',           -- nombre del job
  '5 0 * * 1',                            -- cada lunes a las 00:05 UTC
  $$ SELECT auto_publish_weekly_winner(); $$
);

-- ===============================================
-- VERIFICAR CRON JOBS CONFIGURADOS
-- ===============================================

SELECT * FROM cron.job WHERE jobname = 'auto-publish-weekly-winner';

-- ===============================================
-- VER HISTORIAL DE EJECUCIONES
-- ===============================================

-- Ver últimas 10 ejecuciones del cron job
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-publish-weekly-winner')
ORDER BY start_time DESC
LIMIT 10;

-- ===============================================
-- PROBAR LA FUNCIÓN MANUALMENTE
-- ===============================================

-- Descomenta para probar:
-- SELECT auto_publish_weekly_winner();

-- ===============================================
-- AJUSTAR ZONA HORARIA (OPCIONAL)
-- ===============================================

-- Si estás en Colombia (UTC-5), el cron ejecutará a las 00:05 UTC
-- que es 19:05 del domingo (día anterior)
-- Para ejecutar a las 00:05 hora de Colombia, usa:
-- '5 5 * * 1' (ejecuta a las 05:05 UTC = 00:05 COT)

-- Para cambiar el horario:
-- SELECT cron.unschedule('auto-publish-weekly-winner');
-- SELECT cron.schedule(
--   'auto-publish-weekly-winner',
--   '5 5 * * 1',  -- 00:05 hora de Colombia
--   $$ SELECT auto_publish_weekly_winner(); $$
-- );

-- ===============================================
-- DESACTIVAR AUTO-PUBLICACIÓN (SI ES NECESARIO)
-- ===============================================

-- Para desactivar completamente:
-- SELECT cron.unschedule('auto-publish-weekly-winner');

-- ===============================================
-- NOTAS IMPORTANTES
-- ===============================================

-- 1. pg_cron requiere permisos de superusuario
--    Si no puedes habilitarlo, usa la API route con Vercel Cron o cron externo

-- 2. El job publica el ganador de la SEMANA ANTERIOR (lunes-domingo)
--    Se ejecuta el lunes siguiente para dar tiempo de cerrar la semana

-- 3. Puedes probar ejecutando manualmente:
--    SELECT auto_publish_weekly_winner();

-- 4. Verifica los logs con:
--    SELECT * FROM cron.job_run_details
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-publish-weekly-winner')
--    ORDER BY start_time DESC;
