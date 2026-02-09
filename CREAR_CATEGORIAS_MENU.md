# 🍽️ Crear Categorías del Menú

## Problema

No puedes crear items del menú porque **no hay categorías** creadas.

El código en `app/admin/menu/page.tsx:124-127` valida que exista una categoría seleccionada antes de crear un item.

## ✅ Solución (2 minutos)

### Paso 1: Abre Supabase SQL Editor

https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

### Paso 2: Ejecuta el Script de Categorías

1. Abre el archivo: `supabase-crear-categorias-menu.sql`
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pega en el SQL Editor de Supabase (Ctrl+V)
4. Haz clic en **RUN** (Ctrl+Enter)

### Paso 3: Verifica que se Crearon

Deberías ver 7 categorías:
1. ☕ Desayunos
2. 🍲 Entradas
3. 🍽️ Platos Fuertes
4. 🥗 Ensaladas
5. 🍕 Pizzas
6. 🍰 Postres
7. 🥤 Bebidas

### Paso 4: Recarga la Página de Menú

1. Ve a: http://localhost:3000/admin/menu
2. Presiona **F5**
3. Ahora deberías ver los botones de categorías en la parte superior
4. Haz clic en "Nuevo Item" e intenta crear tu plato de nuevo

## 📝 Cómo Funciona

El script:
- Inserta 7 categorías básicas de restaurante
- Asigna íconos y colores a cada una
- Usa `ON CONFLICT DO NOTHING` para evitar duplicados
- Las ordena por `display_order`

## 🎯 Después de Crear Categorías

Podrás:
1. ✅ Crear items en cualquier categoría
2. ✅ Ver los botones de categorías en la interfaz
3. ✅ Filtrar items por categoría
4. ✅ Cambiar items de categoría al editarlos

## 🔍 Si Aún No Aparecen

Verifica que la tabla existe:

```sql
-- Verificar si existe la tabla
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'menu_categories';

-- Ver todas las categorías
SELECT * FROM menu_categories ORDER BY display_order;
```

## 💡 Agregar Categorías Personalizadas

Si quieres agregar más categorías, usa este formato:

```sql
INSERT INTO menu_categories (name, slug, icon, color, display_order, is_active)
VALUES
  ('Sopas', 'sopas', 'Soup', '#8B5CF6', 8, true),
  ('Parrilla', 'parrilla', 'Flame', '#DC2626', 9, true);
```

**Íconos disponibles:**
- Coffee, Soup, Salad, UtensilsCrossed, Pizza, IceCream, Cake
- (Los que están en `app/admin/menu/page.tsx:45-53`)

---

**Tiempo estimado: 2 minutos**
