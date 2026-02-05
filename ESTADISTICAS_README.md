# Sistema de Estadísticas de Platos Más Pedidos

Sistema completo de estadísticas para rastrear y analizar los platos más pedidos en el restaurante, con filtros por tiempo (hoy, semana, mes, histórico).

## Características

- **Estadísticas en tiempo real**: Consulta basada en datos reales de pedidos
- **Filtros de tiempo**: Hoy, esta semana, este mes, histórico
- **Top 10 platos más pedidos**: Ranking de los platos más vendidos
- **Resumen de ventas**: Total de pedidos, items vendidos, ingresos, ticket promedio
- **Plato estrella**: Destaca el plato más popular del período
- **Estadísticas detalladas**: Tabla completa con todos los platos y sus métricas
- **Panel de administrador**: Interfaz visual atractiva con tarjetas y tablas

## Archivos Creados

### 1. Schema SQL
**Archivo**: `supabase-statistics-schema.sql`

Contiene:
- Vista `item_statistics`: Estadísticas agregadas de todos los items
- Función `get_item_statistics(time_filter)`: Estadísticas con filtro de tiempo
- Función `get_top_items(time_filter, limit)`: Top N platos más vendidos
- Función `get_sales_summary(time_filter)`: Resumen general de ventas
- Índices para optimizar performance

### 2. API Endpoint
**Archivo**: `app/api/statistics/route.ts`

Endpoints:
- `GET /api/statistics?type=items&timeFilter=month`: Todas las estadísticas
- `GET /api/statistics?type=top&timeFilter=week&limit=10`: Top N platos
- `GET /api/statistics?type=summary&timeFilter=today`: Resumen de ventas

Parámetros:
- `type`: 'items' | 'top' | 'summary'
- `timeFilter`: 'today' | 'week' | 'month' | 'all'
- `limit`: número (solo para type='top')

### 3. Tipos TypeScript
**Archivo**: `types/statistics.ts`

Interfaces:
- `ItemStatistic`: Estadísticas detalladas de un item
- `TopItem`: Item del ranking con posición
- `SalesSummary`: Resumen de ventas del período
- `TimeFilter`: Tipo para filtros de tiempo
- `StatisticsResponse<T>`: Respuesta de la API

### 4. Página de Estadísticas
**Archivo**: `app/admin/estadisticas/page.tsx`

Componente React con:
- Filtros de tiempo (botones interactivos)
- 4 tarjetas de resumen (pedidos, items, ingresos, ticket promedio)
- Tabla Top 10 con ranking visual (medallas oro, plata, bronce)
- Sección destacada del "Plato Estrella"
- Tabla detallada de todos los platos
- Auto-actualización con botón de refresh
- Diseño responsive para móvil y desktop

### 5. Navegación
**Archivo modificado**: `components/admin/AdminNavbar.tsx`

Agregado:
- Nuevo item de menú "Estadísticas" con icono BarChart3
- Enlace a `/admin/estadisticas`

## Instalación

### Paso 1: Ejecutar el Schema SQL en Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Navega a **SQL Editor** (icono de base de datos en el menú lateral)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase-statistics-schema.sql`
5. Haz clic en **Run** o presiona `Ctrl+Enter`
6. Verifica que se ejecutó sin errores

**Importante**: El schema SQL crea:
- 1 vista materializada
- 3 funciones PostgreSQL
- 4 índices para optimización

### Paso 2: Verificar Permisos (Opcional)

Si necesitas ajustar permisos para usuarios específicos, descomenta y modifica las líneas al final de `supabase-statistics-schema.sql`:

```sql
GRANT SELECT ON item_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_statistics(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_items(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_summary(TEXT) TO authenticated;
```

### Paso 3: Instalar Dependencias (si es necesario)

La aplicación ya usa `@supabase/supabase-js`, pero verifica que esté instalado:

```bash
npm install @supabase/supabase-js
```

### Paso 4: Variables de Entorno

Asegúrate de tener las siguientes variables en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Paso 5: Ejecutar la Aplicación

```bash
npm run dev
```

### Paso 6: Acceder a las Estadísticas

1. Inicia sesión como administrador
2. Ve al panel de admin: `http://localhost:3000/admin`
3. Haz clic en **Estadísticas** en la barra de navegación
4. Explora los diferentes filtros de tiempo

## Uso

### Filtros de Tiempo

- **Hoy**: Pedidos del día actual (desde las 00:00)
- **Esta Semana**: Pedidos desde el lunes de la semana actual
- **Este Mes**: Pedidos desde el día 1 del mes actual
- **Histórico**: Todos los pedidos registrados

### Métricas Disponibles

**Por Plato**:
- Número de veces pedido
- Total de unidades vendidas
- Ingresos generados
- Promedio de unidades por pedido
- Primera y última vez pedido

**Resumen General**:
- Total de pedidos
- Total de items vendidos
- Ingresos totales
- Items únicos diferentes
- Ticket promedio
- Plato más popular

## Testing

### Probar la API directamente

```bash
# Top 10 platos del mes
curl http://localhost:3000/api/statistics?type=top&timeFilter=month&limit=10

# Resumen de hoy
curl http://localhost:3000/api/statistics?type=summary&timeFilter=today

# Todas las estadísticas históricas
curl http://localhost:3000/api/statistics?type=items&timeFilter=all
```

### Probar las funciones SQL en Supabase

```sql
-- Ver todas las estadísticas
SELECT * FROM item_statistics;

-- Top 5 platos del mes
SELECT * FROM get_top_items('month', 5);

-- Resumen de la semana
SELECT * FROM get_sales_summary('week');

-- Estadísticas de hoy
SELECT * FROM get_item_statistics('today');
```

## Estructura de Datos

### Pedidos Excluidos

El sistema automáticamente **excluye** pedidos con `status = 'cancelled'` de todas las estadísticas para mantener datos precisos.

### Cálculo de Períodos

- **Hoy**: `DATE_TRUNC('day', NOW())`
- **Semana**: `DATE_TRUNC('week', NOW())` (empieza el lunes)
- **Mes**: `DATE_TRUNC('month', NOW())` (empieza el día 1)
- **Histórico**: Sin filtro de fecha

## Optimización

### Índices Creados

1. `idx_table_orders_created_at`: Para filtros por fecha
2. `idx_table_orders_status`: Para filtrar cancelados
3. `idx_table_orders_status_created`: Índice compuesto
4. `idx_table_order_items_item_id`: Para agregaciones por item

Estos índices mejoran significativamente el performance de las queries de estadísticas, especialmente con grandes volúmenes de datos.

## Personalización

### Cambiar el Límite del Top

En la página de estadísticas, puedes cambiar el límite del top modificando el parámetro `limit` en el fetch:

```typescript
fetch(`/api/statistics?type=top&timeFilter=${timeFilter}&limit=20`)
```

### Agregar Más Filtros

Puedes agregar filtros personalizados modificando las funciones SQL en `supabase-statistics-schema.sql`. Por ejemplo, para agregar un filtro "última semana":

```sql
WHEN 'last_week' THEN
  date_threshold := DATE_TRUNC('week', NOW() - INTERVAL '1 week');
```

### Personalizar la UI

El componente en `app/admin/estadisticas/page.tsx` usa Tailwind CSS. Puedes:
- Cambiar colores modificando las clases de Tailwind
- Agregar gráficos usando librerías como `recharts` o `chart.js`
- Modificar el layout de las tablas
- Agregar exportación a CSV/Excel

## Solución de Problemas

### Error: "Failed to fetch statistics"

**Solución**: Verifica que:
1. El schema SQL se ejecutó correctamente en Supabase
2. Las variables de entorno están configuradas
3. El usuario tiene permisos para ejecutar las funciones

### No aparecen datos

**Solución**:
1. Verifica que existan pedidos no cancelados en la base de datos
2. Revisa que los pedidos tengan items asociados
3. Prueba con el filtro "Histórico" para ver todos los datos

### Errores de TypeScript

**Solución**:
1. Ejecuta `npm run build` para ver errores específicos
2. Verifica que `types/statistics.ts` esté correctamente importado
3. Revisa que no haya conflictos de nombres de tipos

## Roadmap Futuro

Posibles mejoras:
- [ ] Gráficos de tendencias con chart.js o recharts
- [ ] Exportación a PDF/Excel
- [ ] Comparación entre períodos
- [ ] Estadísticas por categoría de plato
- [ ] Análisis de horarios pico
- [ ] Predicciones con machine learning
- [ ] Dashboard en tiempo real con WebSockets

## Soporte

Para problemas o preguntas:
1. Revisa la consola del navegador para errores
2. Verifica los logs del servidor Next.js
3. Prueba las funciones SQL directamente en Supabase
4. Revisa la documentación de Supabase: https://supabase.com/docs

---

**Desarrollado con**: Next.js 14, TypeScript, Supabase, Tailwind CSS, Lucide Icons
