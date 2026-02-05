# 🚀 INSTRUCCIONES DE INSTALACIÓN

## ⚠️ IMPORTANTE: Debes ejecutar estos pasos ANTES de usar las estadísticas

Has recibido errores porque las funciones SQL no existen en Supabase. Sigue estos pasos:

---

## Paso 1: Ejecutar Schema de Estadísticas

1. **Abre Supabase**:
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto: `vweicjimlsyquivgcoln`

2. **Abre el SQL Editor**:
   - En el menú lateral, haz clic en el ícono de "SQL Editor" (parece </>)
   - O ve directamente a: https://supabase.com/dashboard/project/vweicjimlsyquivgcoln/sql/new

3. **Ejecuta el primer archivo**:
   - Abre el archivo: `supabase-statistics-schema.sql`
   - Copia TODO su contenido (Ctrl+A, Ctrl+C)
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" o presiona Ctrl+Enter
   - **Espera** a que termine (debería decir "Success")

4. **Verifica** que se crearon:
   - Vista: `item_statistics`
   - Función: `get_item_statistics`
   - Función: `get_top_items`
   - Función: `get_sales_summary`

---

## Paso 2: Ejecutar Schema de Platos de la Semana

1. **En el mismo SQL Editor**:
   - Borra el contenido anterior
   - Abre el archivo: `supabase-weekly-dishes-schema.sql`
   - Copia TODO su contenido
   - Pégalo en el SQL Editor
   - Haz clic en "Run"
   - **Espera** a que termine

2. **Verifica** que se crearon:
   - Tabla: `weekly_featured_dishes`
   - Función: `get_current_week_winner`
   - Función: `publish_weekly_winner`
   - Función: `get_featured_dishes_history`
   - Función: `get_current_featured_dish`

---

## Paso 3: Verificar Instalación

### Probar Estadísticas:

En el SQL Editor de Supabase, ejecuta:

```sql
-- Ver si hay datos de pedidos
SELECT COUNT(*) FROM table_order_items;

-- Probar función de estadísticas
SELECT * FROM get_item_statistics('all') LIMIT 5;

-- Probar top items
SELECT * FROM get_top_items('month', 5);
```

Si ves datos, ¡funcionó! ✅

### Probar Platos de la Semana:

```sql
-- Ver tabla creada
SELECT * FROM weekly_featured_dishes;

-- Probar obtener ganador actual
SELECT * FROM get_current_week_winner();
```

---

## Paso 4: Refrescar la Aplicación

1. **Regresa a tu aplicación**:
   - Ve a http://localhost:3000/admin/estadisticas
   - Presiona F5 para refrescar
   - El error debería desaparecer

2. **Si aún hay error**:
   - Abre la consola del navegador (F12)
   - Ve a la pestaña "Console"
   - Copia el error y revísalo

---

## ¿Qué Acabas de Instalar?

### Sistema de Estadísticas:
- ✅ Vista SQL para agregar datos de ventas
- ✅ Funciones para filtrar por tiempo (hoy, semana, mes)
- ✅ Top N platos más vendidos
- ✅ Resumen de ventas con métricas
- ✅ Índices para mejor rendimiento

### Sistema "Plat de la Semaine":
- ✅ Tabla para historial de ganadores semanales
- ✅ Sistema automático de contador de victorias
- ✅ Badges para platos repetidos (2x, 3x, 5x)
- ✅ Funciones para publicar y consultar ganadores

---

## Próximos Pasos

Una vez instalado correctamente:

1. **Prueba las Estadísticas**:
   - Ve a `/admin/estadisticas`
   - Cambia entre filtros (Hoy, Semana, Mes, Histórico)
   - Verifica que aparecen datos

2. **Publica un Plato de la Semana**:
   - En `/admin/estadisticas`, filtra por "Esta Semana"
   - Haz clic en "Publicar Ganador de la Semana"
   - Ve a la home page (`/`)
   - Scroll hasta ver "Le Plat de la Semaine"

3. **Verifica el Diseño**:
   - El componente debe verse elegante (fondo oscuro, dorado)
   - Si el plato ha ganado antes, debe mostrar un badge

---

## Solución de Problemas Comunes

### Error: "relation does not exist"
**Causa**: La tabla o vista no se creó.
**Solución**: Re-ejecuta el SQL, revisa si hay errores de sintaxis.

### Error: "function does not exist"
**Causa**: Las funciones no se crearon.
**Solución**: Asegúrate de ejecutar TODO el contenido del archivo SQL.

### Error: "permission denied"
**Causa**: Permisos insuficientes.
**Solución**:
- Verifica que estás usando `SUPABASE_SERVICE_ROLE_KEY` en el servidor
- Revisa que las credenciales en `.env.local` son correctas

### No aparecen datos en estadísticas
**Causa**: No hay pedidos en la base de datos.
**Solución**:
- Crea algunos pedidos de prueba
- O usa datos históricos si ya tienes

### El botón "Publicar" no aparece
**Causa**: No estás en el filtro "Esta Semana".
**Solución**: Cambia el filtro de tiempo a "Esta Semana".

---

## Comandos Útiles para Verificar

### En SQL Editor de Supabase:

```sql
-- Ver todas las funciones creadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%statistics%' OR routine_name LIKE '%weekly%';

-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Contar pedidos por plato
SELECT
  item_name,
  COUNT(*) as veces_pedido,
  SUM(quantity) as unidades_vendidas
FROM table_order_items toi
JOIN table_orders tor ON toi.order_id = tor.id
WHERE tor.status != 'cancelled'
GROUP BY item_name
ORDER BY unidades_vendidas DESC
LIMIT 10;
```

---

## Notas Importantes

⚠️ **No borres estos archivos SQL**:
- `supabase-statistics-schema.sql`
- `supabase-weekly-dishes-schema.sql`

Los necesitarás si:
- Migras a otra base de datos
- Necesitas recrear las funciones
- Trabajas en otro ambiente (staging, production)

📝 **Backups**:
- Supabase hace backups automáticos
- Pero guarda estos archivos SQL en tu repositorio Git

🔒 **Seguridad**:
- Las funciones usan `SUPABASE_SERVICE_ROLE_KEY`
- Esta key tiene permisos completos
- NUNCA la expongas en el cliente
- Solo úsala en API routes del servidor

---

## Contacto de Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Revisa los logs de Supabase
2. Verifica la consola del navegador (F12)
3. Comparte el error específico que aparece

---

**¡Listo!** Una vez ejecutes los SQL en Supabase, todo debería funcionar perfectamente. 🎉
