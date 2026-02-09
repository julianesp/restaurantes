# ⚠️ INSTRUCCIONES URGENTES - Instalar Funciones SQL

## El Error Actual

El error `"Failed to fetch predictive statistics"` ocurre porque las **funciones SQL no están creadas en Supabase**.

## ✅ Solución en 3 Pasos (5 minutos)

### Paso 1: Abrir Supabase SQL Editor

1. Ve a: https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new
2. O navega manualmente:
   - Abre https://app.supabase.com
   - Selecciona tu proyecto `vweicjimlsyquivgcoln`
   - Haz clic en **"SQL Editor"** en el menú lateral izquierdo
   - Haz clic en el botón **"New query"**

### Paso 2: Verificar Estado Actual (OPCIONAL)

Antes de instalar, puedes verificar si las funciones ya existen:

1. En el SQL Editor, pega este código:

```sql
SELECT
    routine_name as "Función",
    routine_type as "Tipo"
FROM information_schema.routines
WHERE routine_name IN (
    'get_predictive_dish_analysis',
    'get_hourly_order_patterns',
    'get_customer_favorite_patterns'
)
AND routine_schema = 'public';
```

2. Haz clic en **RUN** (o Ctrl+Enter)
3. Si retorna **0 filas**, necesitas continuar con el Paso 3
4. Si retorna **3 filas**, las funciones ya están instaladas y el error es otro

### Paso 3: Instalar las Funciones (EJECUTAR ESTE)

1. En el SQL Editor, **borra todo** el contenido actual
2. Abre el archivo: `/home/julian/Documentos/sites/restaurantes/supabase-predictive-statistics.sql`
3. Selecciona TODO el contenido (Ctrl+A)
4. Cópialo (Ctrl+C)
5. Pégalo en el SQL Editor de Supabase (Ctrl+V)
6. Haz clic en el botón **RUN** (o presiona Ctrl+Enter)
7. Espera a que termine (debería decir "Success. No rows returned")

### Paso 4: Verificar Instalación

Después de ejecutar el script, verifica con esta consulta:

```sql
-- Debería retornar datos (o array vacío si no hay pedidos)
SELECT * FROM get_predictive_dish_analysis(30, 0.3) LIMIT 5;
```

Si esta consulta funciona sin errores, ¡la instalación fue exitosa!

### Paso 5: Recargar la Aplicación

1. Ve de vuelta a: http://localhost:3000/admin/estadisticas
2. Presiona **F5** o el botón "Actualizar"
3. El error debería desaparecer

## 🎯 Acceso Rápido

**SQL Editor de tu proyecto:**
https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

**Archivo a copiar:**
`/home/julian/Documentos/sites/restaurantes/supabase-predictive-statistics.sql`

## 📝 Nota Importante

Las funciones SQL son necesarias porque:
- La API de Next.js llama a `supabaseAdmin.rpc('get_predictive_dish_analysis', ...)`
- Estas funciones RPC deben existir en Supabase
- No se crean automáticamente, debes ejecutar el script SQL manualmente

## ❓ Problemas Comunes

### "No tengo acceso a Supabase"
- Contacta al administrador del proyecto
- O pide las credenciales de Supabase

### "El script da error al ejecutar"
- Copia el error completo
- Verifica que copiaste TODO el archivo `supabase-predictive-statistics.sql`
- Asegúrate de que las tablas `table_orders` y `table_order_items` existen

### "Sigue sin funcionar después de ejecutar"
- Limpia el caché del navegador (Ctrl+Shift+R)
- Verifica en el SQL Editor que las funciones existen (consulta del Paso 2)
- Revisa la consola del navegador (F12 → Console) para más detalles del error

## ✅ Checklist Final

- [ ] Abrí Supabase SQL Editor
- [ ] Copié TODO el contenido de `supabase-predictive-statistics.sql`
- [ ] Lo pegué en el SQL Editor
- [ ] Hice clic en RUN
- [ ] Vi "Success" sin errores
- [ ] Verifiqué con `SELECT * FROM get_predictive_dish_analysis(30, 0.3) LIMIT 5;`
- [ ] Recargué la página de estadísticas
- [ ] El error desapareció

---

**Tiempo estimado total: 5 minutos**
