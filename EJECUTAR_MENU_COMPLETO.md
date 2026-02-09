# 🍽️ Crear Tablas del Menú + Categorías

## ⚠️ Problema

La tabla `menu_categories` no existe en Supabase.

Error: `relation "menu_categories" does not exist`

## ✅ Solución Completa (2 minutos)

He creado un **script único** que hace todo en orden:
1. ✅ Crea las tablas (`menu_categories`, `menu_items`)
2. ✅ Crea índices y triggers
3. ✅ Configura Row Level Security (RLS)
4. ✅ Inserta las 7 categorías
5. ✅ Verifica que todo esté correcto

### Paso 1: Abre Supabase SQL Editor

https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

### Paso 2: Ejecuta el Script Completo

1. Abre el archivo: **`supabase-menu-completo.sql`** ← ESTE
2. Selecciona TODO (Ctrl+A)
3. Copia (Ctrl+C)
4. Pega en Supabase SQL Editor (Ctrl+V)
5. Haz clic en **RUN** (Ctrl+Enter)

### Paso 3: Verifica los Resultados

Deberías ver en la salida:

```
Status: "Tablas creadas:"
- menu_categories
- menu_items

Status: "Categorías insertadas:"
- Desayunos
- Entradas
- Platos Fuertes
- Ensaladas
- Pizzas
- Postres
- Bebidas
```

### Paso 4: Recarga la Página

1. Ve a: http://localhost:3000/admin/menu
2. Presiona **F5**
3. Ahora verás los **botones de categorías** en la parte superior:
   - ☕ Desayunos
   - 🍲 Entradas
   - 🍽️ Platos Fuertes
   - 🥗 Ensaladas
   - 🍕 Pizzas
   - 🍰 Postres
   - 🥤 Bebidas

### Paso 5: Crea tu Primer Plato

1. Haz clic en cualquier categoría (ej: "Desayunos")
2. Haz clic en **"Nuevo Item"**
3. Llena el formulario:
   - Nombre: "Huevos Revueltos"
   - Descripción: "Con pan tostado"
   - Precio: "12000" (sin símbolos)
4. Haz clic en **"Crear"**
5. ¡Debería funcionar! ✅

## 🔍 Si Hay Problemas

### Las tablas ya existen
Si dice que las tablas ya existen, está bien. El script usa `CREATE TABLE IF NOT EXISTS`, así que no causará errores.

### Verificar manualmente
```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver todas las categorías
SELECT * FROM menu_categories ORDER BY display_order;

-- Ver todos los items del menú
SELECT * FROM menu_items;
```

## 📋 Qué Incluye el Script

1. **Tablas**:
   - `menu_categories` - Categorías del menú
   - `menu_items` - Platos/items del menú

2. **Seguridad**:
   - Row Level Security (RLS) habilitado
   - Lectura pública solo de items disponibles
   - Escritura solo desde backend (service role)

3. **Optimización**:
   - Índices en campos más consultados
   - Triggers para actualizar `updated_at` automáticamente

4. **Datos Iniciales**:
   - 7 categorías con íconos y colores

## 💡 Próximos Pasos

Una vez que tengas el menú configurado:
1. Agrega varios platos en diferentes categorías
2. Simula algunos pedidos desde la app de cliente
3. Ve a **Admin → Estadísticas** para ver el análisis predictivo funcionando

---

**Tiempo estimado: 2 minutos**
