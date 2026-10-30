-- Límite de intentos (ver lib/rate-limit.ts), p. ej. para el PIN de los meseros (/api/waiters/verify).
--
-- Ventana fija por clave: `count` intentos desde `window_start`. Al vencer la ventana, el siguiente
-- intento la reinicia. Las filas viejas las borra el cron diario.

CREATE TABLE rate_limits (
  -- Clave del límite, p. ej. "pin:ip:<restaurant_id>:<ip>" o "pin:rest:<restaurant_id>"
  key           TEXT PRIMARY KEY,
  count         INTEGER NOT NULL DEFAULT 0,
  -- Milisegundos desde epoch (comparación numérica exacta)
  window_start  INTEGER NOT NULL
);
CREATE INDEX idx_rate_limits_window ON rate_limits (window_start);
