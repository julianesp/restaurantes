# 🚀 Checklist de Deployment - Sistema Completo

Sistema de estadísticas y publicación automática del plato de la semana listo para producción.

## ✅ Completado en Desarrollo

- [x] Sistema de estadísticas funcionando
- [x] Página de estadísticas en admin
- [x] Componente "Plat de la Semaine" en home page
- [x] API endpoint para auto-publicación
- [x] Datos de prueba creados
- [x] Publicación manual desde admin funcionando
- [x] Middleware configurado para rutas públicas

---

## 📦 Checklist para Deployment a Producción

### Paso 1: Preparar Supabase (Producción)

- [ ] **Ejecutar schemas SQL en Supabase de producción**:
  1. Ve a: https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new
  2. Ejecuta en este orden:
     - `supabase-statistics-schema.sql` (o `supabase-fix-statistics.sql` si ya ejecutaste el primero)
     - `supabase-fix-sales-summary.sql`
     - `supabase-weekly-dishes-schema.sql`

- [ ] **Verificar que las funciones se crearon**:
  ```sql
  SELECT routine_name FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND (routine_name LIKE '%statistics%' OR routine_name LIKE '%weekly%')
  ORDER BY routine_name;
  ```

- [ ] **Verificar tablas**:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('weekly_featured_dishes', 'menu_items', 'table_orders', 'table_order_items');
  ```

### Paso 2: Configurar Variables de Entorno en Vercel

- [ ] **Ir a Vercel Dashboard**:
  - https://vercel.com/dashboard
  - Selecciona tu proyecto
  - Settings → Environment Variables

- [ ] **Agregar/Verificar variables** (para todos los entornos: Production, Preview, Development):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://vweicjimlsyquivgcoln.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
  CRON_SECRET=mi_token_secreto_123456
  ```

  **IMPORTANTE**: Cambia `CRON_SECRET` por un token seguro único para producción.

- [ ] **Generar nuevo CRON_SECRET seguro**:
  ```bash
  # Genera un token aleatorio seguro:
  openssl rand -base64 32
  ```

### Paso 3: Deploy a Vercel

- [ ] **Commit y push de cambios**:
  ```bash
  git add .
  git commit -m "Add weekly dish statistics and auto-publish system"
  git push origin main
  ```

- [ ] **Esperar a que Vercel despliegue** (automático si conectaste con GitHub)

- [ ] **Verificar deployment**:
  - Ve a Vercel Dashboard → Deployments
  - Espera "Ready" ✅

### Paso 4: Verificar Cron Job en Producción

- [ ] **Verificar que el cron está configurado**:
  - Vercel Dashboard → tu proyecto → Cron Jobs
  - Deberías ver: `publish-weekly-winner`
  - Schedule: `0 5 * * 1` (cada lunes 00:00 Colombia)

- [ ] **Probar endpoint manualmente**:
  ```bash
  # Reemplaza TU_DOMINIO y TU_CRON_SECRET
  curl https://TU_DOMINIO.vercel.app/api/cron/publish-weekly-winner \
    -H "Authorization: Bearer TU_CRON_SECRET"
  ```

- [ ] **Verificar respuesta**:
  - Debería retornar JSON exitoso
  - Si ya publicaste esta semana: "Winner already published"
  - Si no: "Weekly winner published successfully"

### Paso 5: Verificar en el Sitio Web

- [ ] **Ir a la home page**: https://TU_DOMINIO.vercel.app

- [ ] **Scroll hasta "Le Plat de la Semaine"**:
  - Debe aparecer con diseño elegante francés
  - Fondo oscuro (negro/púrpura)
  - Muestra el plato ganador
  - Estadísticas visibles (unidades vendidas, pedidos)

- [ ] **Verificar admin**: https://TU_DOMINIO.vercel.app/admin/estadisticas
  - Botón "Publicar Ganador de la Semana" visible
  - Estadísticas cargando correctamente
  - Filtros funcionando (Hoy, Semana, Mes, Histórico)

### Paso 6: Primera Publicación Manual (Producción)

- [ ] **Publicar primer plato manualmente**:
  1. Ve a: https://TU_DOMINIO.vercel.app/admin/estadisticas
  2. Inicia sesión como admin
  3. Filtra por "Esta Semana"
  4. Click en "Publicar Ganador de la Semana"
  5. Confirma la acción

- [ ] **Verificar en Supabase**:
  ```sql
  SELECT * FROM weekly_featured_dishes
  ORDER BY published_at DESC
  LIMIT 1;
  ```

- [ ] **Verificar en la home page**:
  - Refresca: https://TU_DOMINIO.vercel.app
  - El plato debe aparecer en "Le Plat de la Semaine"

---

## 🎯 Testing del Sistema Completo

### Test 1: Estadísticas
- [ ] Ve a `/admin/estadisticas`
- [ ] Cambia entre filtros (Hoy, Semana, Mes, Histórico)
- [ ] Verifica que los números cambian
- [ ] Top 10 muestra platos correctos

### Test 2: Publicación Manual
- [ ] Filtra por "Esta Semana"
- [ ] Click en "Publicar Ganador"
- [ ] Mensaje de éxito aparece
- [ ] Va a home page y verifica que aparece

### Test 3: Plato de la Semana en Home
- [ ] Scroll hasta la sección francesa
- [ ] Plato se muestra con diseño elegante
- [ ] Estadísticas correctas
- [ ] Badge aparece si ha ganado múltiples veces

### Test 4: Auto-publicación (Manual)
- [ ] Ejecuta el cron manualmente desde Vercel
- [ ] O usa curl con el endpoint
- [ ] Verifica que publica correctamente
- [ ] Si ya existe, muestra "already published"

### Test 5: Historial
- [ ] En home page, scroll hasta "Galerie des Champions"
- [ ] Deben aparecer los últimos 3 ganadores
- [ ] Con mini-badges si han ganado múltiples veces

---

## 🔒 Seguridad

### Antes de Producción:

- [ ] **Cambiar CRON_SECRET** a un valor único y fuerte
- [ ] **No commitear** el archivo `.env.local`
- [ ] **Verificar** que `.env.local` está en `.gitignore`
- [ ] **Rotar keys** de Supabase si fueron expuestas

### Verificar .gitignore:

```bash
# Ejecutar en terminal:
grep -q ".env.local" .gitignore && echo "✅ .env.local está ignorado" || echo "❌ AGREGAR .env.local a .gitignore"
```

---

## 📊 Monitoreo Post-Deployment

### Primera Semana:

- [ ] **Lunes siguiente**: Verificar que el cron se ejecutó
  - Vercel → Functions → Logs
  - Buscar: `publish-weekly-winner`
  - Debe mostrar ejecución exitosa

- [ ] **Verificar nuevo plato publicado**:
  ```sql
  SELECT item_name, week_start_date, published_by
  FROM weekly_featured_dishes
  WHERE published_by = 'cron-auto'
  ORDER BY published_at DESC
  LIMIT 1;
  ```

- [ ] **Home page actualizada**: El plato debe cambiar automáticamente

### Monitoreo Continuo:

- [ ] **Logs de Vercel**: Revisar semanalmente
- [ ] **Supabase**: Verificar ejecuciones de funciones
- [ ] **Home page**: Verificar que se actualiza cada lunes

---

## 🔧 Troubleshooting Común

### Cron no se ejecuta:
1. Verifica que `vercel.json` está en la raíz
2. Verifica que `CRON_SECRET` está configurado
3. Revisa logs en Vercel Dashboard → Functions

### Error 401 Unauthorized:
1. Verifica que `CRON_SECRET` coincide en:
   - `.env.local` (desarrollo)
   - Vercel Environment Variables (producción)
2. Si usas curl, verifica el header Authorization

### No aparece plato en home page:
1. Verifica que se publicó: `SELECT * FROM weekly_featured_dishes`
2. Refresca la cache de Vercel
3. Verifica que hay pedidos de esta semana

### Estadísticas no cargan:
1. Verifica que las funciones SQL existen
2. Revisa console del navegador (F12)
3. Verifica que `item_price` se convierte correctamente

---

## 📝 Notas Finales

### Archivos Importantes a Mantener:

- `supabase-statistics-schema.sql`
- `supabase-fix-statistics.sql`
- `supabase-fix-sales-summary.sql`
- `supabase-weekly-dishes-schema.sql`
- `supabase-auto-publish-weekly.sql`
- `vercel.json`
- `middleware.ts`
- `ESTADISTICAS_README.md`
- `PLATO_SEMANA_README.md`
- `AUTOMATIZACION_PLATO_SEMANA.md`

### Estructura del Sistema:

```
Sistema de Estadísticas
├── Base de Datos (Supabase)
│   ├── Vistas SQL para agregaciones
│   ├── Funciones con filtros de tiempo
│   └── Tabla de historial de ganadores
│
├── Backend (Next.js API)
│   ├── /api/statistics - Consultar estadísticas
│   ├── /api/weekly-dishes - Gestionar platos destacados
│   └── /api/cron/publish-weekly-winner - Auto-publicación
│
├── Frontend (React/Next.js)
│   ├── /admin/estadisticas - Panel de estadísticas
│   ├── PlatDeLaSemaine - Componente en home page
│   └── Botón de publicación manual
│
└── Automatización (Vercel Cron)
    └── Se ejecuta cada lunes 00:00
```

---

## ✅ Checklist Final

Antes de considerar completo:

- [ ] Todos los SQL ejecutados en Supabase producción
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso a Vercel
- [ ] Cron job verificado y funcionando
- [ ] Primera publicación manual exitosa
- [ ] Plato visible en home page
- [ ] Estadísticas funcionando en admin
- [ ] Documentación revisada
- [ ] CRON_SECRET cambiado para producción
- [ ] Sistema monitoreado la primera semana

---

**🎉 Una vez completado este checklist, tu sistema estará 100% funcional y automatizado!**

Cada lunes a medianoche, automáticamente:
1. ✅ Detecta el plato más vendido de la semana anterior
2. ✅ Lo publica en la home page con diseño elegante
3. ✅ Actualiza el contador si ya ganó antes
4. ✅ Muestra badges especiales (2x, 3x, 5x)
5. ✅ Mantiene historial de todos los ganadores

**Sin intervención manual necesaria** 🚀
