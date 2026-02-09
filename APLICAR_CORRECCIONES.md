# 🔧 Aplicar Correcciones - SQL Actualizado

## ⚠️ Problema Encontrado

El error específico era: **"column reference 'item_id' is ambiguous"**

Ya corregí el archivo SQL. Ahora necesitas volver a ejecutarlo en Supabase.

## ✅ Solución (2 minutos)

### Paso 1: Abre Supabase SQL Editor

https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

### Paso 2: Ejecuta el Script Corregido

1. **Borra todo** el contenido del editor SQL
2. Abre el archivo: `supabase-predictive-statistics.sql` (ya está corregido)
3. **Selecciona TODO** (Ctrl+A)
4. **Copia** (Ctrl+C)
5. **Pega** en Supabase SQL Editor (Ctrl+V)
6. Haz clic en **RUN** (Ctrl+Enter)

### Paso 3: Verifica la Corrección

Ejecuta esta consulta de prueba:

```sql
SELECT * FROM get_predictive_dish_analysis(30, 0.3) LIMIT 5;
```

Debería funcionar sin errores ahora.

### Paso 4: Recarga la Aplicación

1. Ve a: http://localhost:3000/admin/estadisticas
2. Presiona **F5** o haz clic en "Actualizar"
3. El error debería desaparecer

## 🔍 ¿Qué se Corrigió?

**Antes:**
```sql
peak_hours AS (
  SELECT
    item_id,  -- ❌ Ambiguo
    peak_hour,
    ...
  FROM item_stats
)
```

**Después:**
```sql
peak_hours AS (
  SELECT
    ist.item_id,  -- ✅ Explícito
    ist.peak_hour,
    ...
  FROM item_stats ist
)
```

## 📝 Nota

Como las funciones usan `CREATE OR REPLACE FUNCTION`, al ejecutar el script nuevamente se actualizarán automáticamente sin borrar las existentes.

---

**Tiempo estimado: 2 minutos**
