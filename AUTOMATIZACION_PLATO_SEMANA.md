# 🤖 Automatización de Publicación Semanal

Sistema automático para publicar el plato ganador de cada semana todos los lunes sin intervención manual.

## Soluciones Disponibles

Tienes **3 opciones** para automatizar la publicación:

---

## ✅ Opción 1: Vercel Cron Jobs (RECOMENDADA)

**Ventajas:**
- ✅ Fácil de configurar
- ✅ Gratis en Vercel Pro
- ✅ No requiere permisos especiales en Supabase
- ✅ Logs visibles en Vercel Dashboard

**Desventajas:**
- ❌ Solo funciona si despliegas en Vercel

### Configuración:

#### Paso 1: Agregar Variable de Entorno

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Settings → Environment Variables
3. Agrega:
   - **Name**: `CRON_SECRET`
   - **Value**: Un token secreto (genera uno seguro)
   - Ejemplo: `cron_secret_abc123xyz789`

#### Paso 2: Ya está configurado

El archivo `vercel.json` ya está creado con:
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-weekly-winner",
      "schedule": "0 5 * * 1"
    }
  ]
}
```

**Schedule**: `0 5 * * 1`
- Ejecuta cada **lunes** a las **05:00 UTC**
- En Colombia (UTC-5): **00:00 del lunes** (medianoche)

#### Paso 3: Deploy

```bash
git add .
git commit -m "Add weekly auto-publish cron"
git push
```

Vercel detectará automáticamente el `vercel.json` y configurará el cron.

#### Paso 4: Verificar

1. Ve a: Vercel Dashboard → tu proyecto → Cron Jobs
2. Deberías ver: `publish-weekly-winner` programado
3. Puedes ejecutarlo manualmente para probar

### Ajustar Horario

Para cambiar el horario, edita `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-weekly-winner",
      "schedule": "0 6 * * 1"  // Lunes 06:00 UTC = 01:00 Colombia
    }
  ]
}
```

**Ejemplos de schedules:**
- `0 5 * * 1` - Lunes 00:00 Colombia
- `0 12 * * 1` - Lunes 07:00 Colombia
- `30 9 * * 1` - Lunes 04:30 Colombia

---

## ✅ Opción 2: Supabase pg_cron

**Ventajas:**
- ✅ Se ejecuta directamente en la base de datos
- ✅ No depende de Vercel
- ✅ Más confiable (no depende de servidor externo)

**Desventajas:**
- ❌ Requiere permisos de superusuario en Supabase
- ❌ No disponible en plan gratuito de Supabase

### Configuración:

#### Paso 1: Verificar si pg_cron está disponible

En Supabase SQL Editor:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

Si no aparece, intenta:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

Si da error de permisos, contacta a soporte de Supabase o usa otra opción.

#### Paso 2: Ejecutar el Script

1. Abre: `supabase-auto-publish-weekly.sql`
2. Copia TODO el contenido
3. Pégalo en Supabase SQL Editor
4. Ejecuta

Esto creará:
- Función `auto_publish_weekly_winner()`
- Cron job programado para lunes 00:05 UTC

#### Paso 3: Verificar

```sql
-- Ver cron jobs configurados
SELECT * FROM cron.job WHERE jobname = 'auto-publish-weekly-winner';

-- Ver historial de ejecuciones
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-publish-weekly-winner')
ORDER BY start_time DESC;
```

#### Paso 4: Probar Manualmente

```sql
SELECT auto_publish_weekly_winner();
```

### Ajustar Horario

```sql
-- Desactivar job actual
SELECT cron.unschedule('auto-publish-weekly-winner');

-- Crear nuevo con horario diferente
SELECT cron.schedule(
  'auto-publish-weekly-winner',
  '5 5 * * 1',  -- Lunes 00:05 hora de Colombia
  $$ SELECT auto_publish_weekly_winner(); $$
);
```

---

## ✅ Opción 3: Cron Externo (cron-job.org, EasyCron)

**Ventajas:**
- ✅ Funciona independiente de tu hosting
- ✅ Gratis en servicios como cron-job.org

**Desventajas:**
- ❌ Requiere configurar servicio externo
- ❌ Necesitas exponer el endpoint públicamente

### Configuración:

#### Paso 1: Agregar CRON_SECRET

En `.env.local`:
```
CRON_SECRET=tu_token_super_secreto_aqui_123456
```

#### Paso 2: Configurar en cron-job.org

1. Ve a: https://cron-job.org/
2. Crea cuenta gratuita
3. Create Cronjob:
   - **URL**: `https://tu-dominio.com/api/cron/publish-weekly-winner`
   - **Schedule**: Every Monday at 00:00
   - **Request Method**: GET
   - **Headers**:
     ```
     Authorization: Bearer tu_token_super_secreto_aqui_123456
     ```

#### Paso 3: Probar

Ejecuta manualmente desde cron-job.org o prueba con curl:

```bash
curl -X GET \
  https://tu-dominio.com/api/cron/publish-weekly-winner \
  -H "Authorization: Bearer tu_token_super_secreto_aqui_123456"
```

---

## 🧪 Probar Manualmente

### Desde el Navegador (solo en desarrollo)

Si no tienes `CRON_SECRET` configurado:
```
http://localhost:3000/api/cron/publish-weekly-winner
```

### Desde la Terminal

Con token:
```bash
curl -X GET http://localhost:3000/api/cron/publish-weekly-winner \
  -H "Authorization: Bearer tu_cron_secret"
```

Sin token (desarrollo):
```bash
curl http://localhost:3000/api/cron/publish-weekly-winner
```

### Respuesta Esperada

**Éxito:**
```json
{
  "success": true,
  "message": "Weekly winner published successfully",
  "winner": {
    "id": "uuid-123",
    "name": "Bandeja Paisa",
    "totalSold": 45,
    "totalOrders": 32
  },
  "weekStart": "2025-01-27",
  "weekEnd": "2025-02-02"
}
```

**Sin datos:**
```json
{
  "success": true,
  "message": "No sales data for last week",
  "weekStart": "2025-01-27",
  "weekEnd": "2025-02-02"
}
```

**Ya publicado:**
```json
{
  "success": true,
  "message": "Winner already published",
  "winner": "Bandeja Paisa",
  "weekStart": "2025-01-27",
  "weekEnd": "2025-02-02"
}
```

---

## 📊 Monitoreo

### Ver Logs en Vercel

1. Vercel Dashboard → Functions
2. Encuentra: `/api/cron/publish-weekly-winner`
3. Click para ver logs de ejecución

### Ver Historial en Supabase

```sql
SELECT * FROM weekly_featured_dishes
WHERE published_by = 'cron-auto'
ORDER BY published_at DESC;
```

### Verificar Última Ejecución

```sql
SELECT
  item_name,
  week_start_date,
  week_end_date,
  total_quantity_sold,
  published_at,
  published_by
FROM weekly_featured_dishes
ORDER BY published_at DESC
LIMIT 1;
```

---

## 🔧 Solución de Problemas

### El cron no se ejecuta

**Vercel:**
- Verifica que `vercel.json` está en la raíz del proyecto
- Verifica que hiciste deploy después de agregar el archivo
- Revisa logs en Vercel Dashboard → Cron Jobs

**Supabase:**
- Verifica que pg_cron está habilitado: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
- Revisa logs: `SELECT * FROM cron.job_run_details`

### Error 401 Unauthorized

**Causa**: El token `CRON_SECRET` no coincide.

**Solución**:
1. Verifica que `CRON_SECRET` está en variables de entorno de Vercel
2. Asegúrate de que el header `Authorization: Bearer <token>` es correcto
3. Verifica que desplegaste después de agregar la variable

### Error 500 Internal Server Error

**Causa**: Error en la función SQL o datos inválidos.

**Solución**:
1. Revisa logs del servidor
2. Prueba manualmente: `SELECT auto_publish_weekly_winner();` (Supabase)
3. Verifica que las funciones SQL están creadas correctamente

### No hay ganador para publicar

**Causa**: No hubo ventas la semana anterior.

**Solución**:
- Es normal si no hubo pedidos
- El cron simplemente esperará hasta la siguiente semana
- Puedes verificar: `SELECT * FROM get_current_week_winner();`

---

## 🎯 Recomendación

**Para producción**: Usa **Vercel Cron Jobs** (Opción 1)
- Más fácil de configurar
- Logs visibles
- Sin permisos especiales necesarios

**Para máximo control**: Usa **Supabase pg_cron** (Opción 2)
- Se ejecuta en la base de datos
- Más confiable
- No depende de servicios externos

---

## 📝 Checklist de Configuración

- [ ] Elegir método de automatización (Vercel/Supabase/Externo)
- [ ] Configurar `CRON_SECRET` en variables de entorno
- [ ] Ejecutar scripts SQL necesarios en Supabase
- [ ] Desplegar cambios (si usas Vercel)
- [ ] Probar ejecución manual del endpoint
- [ ] Verificar que el cron está programado
- [ ] Esperar al lunes siguiente para verificar ejecución automática
- [ ] Revisar logs después de la primera ejecución

---

## 🚀 Estado Actual

✅ API endpoint creado: `/api/cron/publish-weekly-winner`
✅ Función SQL creada: `auto_publish_weekly_winner()`
✅ Vercel cron configurado: `vercel.json`
✅ Sistema de seguridad con token implementado

**Próximo paso**: Despliega a Vercel y el sistema funcionará automáticamente cada lunes! 🎉
