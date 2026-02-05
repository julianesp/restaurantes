# Configuración de Supabase para Restaurante Munay

## Paso 1: Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales que te proporcionen

## Paso 2: Configurar las variables de entorno

1. Copia las credenciales de tu proyecto Supabase
2. Ve a Project Settings > API en tu dashboard de Supabase
3. Copia las siguientes claves a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

⚠️ **IMPORTANTE**: Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY` públicamente.

## Paso 3: Crear las tablas en Supabase

1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- Tabla `menu_categories` para las categorías del menú
- Tabla `menu_items` para los items del menú
- Índices para optimizar las consultas
- Políticas de seguridad (RLS) para proteger los datos
- Triggers para actualizar automáticamente las fechas de modificación

## Paso 4: Verificar las tablas

1. Ve a **Table Editor** en tu dashboard
2. Deberías ver las tablas:
   - `menu_categories`
   - `menu_items`

## Paso 5: Insertar datos iniciales (Opcional)

Una vez configurado, puedes usar el panel de administración (`/admin/menu`) para:
- Crear categorías del menú
- Agregar items al menú
- Gestionar precios y descripciones

O también puedes ejecutar el script de migración que se creará para importar los datos existentes.

## Estructura de las tablas

### menu_categories
- `id`: UUID (Primary Key)
- `name`: Nombre de la categoría
- `slug`: Identificador único (ej: "desayunos", "bebidas")
- `icon`: Nombre del ícono de Lucide React
- `color`: Clase de color de Tailwind
- `display_order`: Orden de visualización
- `is_active`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### menu_items
- `id`: UUID (Primary Key)
- `category_id`: ID de la categoría (Foreign Key)
- `name`: Nombre del plato
- `description`: Descripción del plato
- `price`: Precio (formato texto, ej: "$12.000")
- `is_vegetarian`: Si es vegetariano
- `is_spicy`: Si es picante
- `is_available`: Si está disponible
- `display_order`: Orden de visualización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## Seguridad

Las tablas están protegidas con Row Level Security (RLS):
- **Lectura pública**: Los usuarios pueden ver solo categorías activas e items disponibles
- **Escritura restringida**: Solo el admin puede crear, actualizar o eliminar datos (usando service role key)

## Soporte

Si tienes problemas, consulta:
- [Documentación de Supabase](https://supabase.com/docs)
- [Guías de Supabase](https://supabase.com/docs/guides)
