# ⭐ Gestión de Platos Destacados Homepage

## 📋 Descripción

Sistema completo para gestionar los platos que aparecen en el **carousel de la página principal** (homepage). Ahora puedes administrar estos platos desde el panel de admin sin tocar código.

## ✨ Características

- ✅ Panel de administración dedicado
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Cambiar orden de visualización con flechas
- ✅ Activar/Desactivar platos sin eliminarlos
- ✅ Soporte para imágenes (URL)
- ✅ Vista previa en tiempo real
- ✅ Responsive y con tema oscuro/claro

## 🚀 Instalación (IMPORTANTE)

### Paso 1: Ejecutar el Script SQL

1. Abre Supabase SQL Editor:
   https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

2. Copia y ejecuta el archivo:
   **`supabase-featured-dishes-schema.sql`**

3. Haz clic en **RUN**

Esto creará:
- ✅ Tabla `featured_dishes`
- ✅ Índices de rendimiento
- ✅ Triggers automáticos
- ✅ Row Level Security (RLS)
- ✅ 5 platos de ejemplo (migrando los actuales)

### Paso 2: Verificar en Supabase

```sql
SELECT * FROM featured_dishes ORDER BY display_order;
```

Deberías ver 5 platos ya creados.

## 📍 Acceso al Panel

### URL:
http://localhost:3000/admin/platos-destacados

### Navegación:
Admin → Platos Destacados (icono ⭐)

## 🎨 Cómo Usar

### Crear un Nuevo Plato Destacado

1. Haz clic en **"Nuevo Plato Destacado"**
2. Llena el formulario:
   - **Nombre** * (requerido): Ej: "Bandeja Paisa Especial"
   - **Descripción** * (requerido): Descripción atractiva y detallada
   - **Precio** * (requerido): Ej: "$28.000"
   - **URL de Imagen**: URL completa de la imagen
   - **Orden**: Número para ordenar (menor = primero)
3. Haz clic en **"Crear"**

### Editar un Plato

1. Haz clic en el ícono de **lápiz (Edit)**
2. Modifica los campos que desees
3. Haz clic en **"Actualizar"**

### Cambiar el Orden

- **Flecha Arriba** ⬆️: Mover hacia arriba en el carousel
- **Flecha Abajo** ⬇️: Mover hacia abajo en el carousel

El primer plato (orden 1) aparece primero en el carousel.

### Activar/Desactivar

- Haz clic en el botón **"Activo"/"Inactivo"**
- Los platos inactivos NO aparecen en la homepage
- Se mantienen en la base de datos para activarlos después

### Eliminar un Plato

1. Haz clic en el ícono de **basura (Delete)**
2. Confirma la eliminación
3. ⚠️ Esta acción **NO se puede deshacer**

## 🖼️ Cómo Subir Imágenes

### Opción 1: Usar Vercel Blob (Recomendado)

```bash
npm install @vercel/blob
```

Puedes usar el storage de Vercel Blob (ya tienes URLs de ejemplo en el código).

### Opción 2: Cloudinary

1. Crea cuenta en https://cloudinary.com
2. Sube tu imagen
3. Copia la URL pública
4. Pégala en el campo "URL de Imagen"

### Opción 3: ImgBB

1. Ve a https://imgbb.com
2. Sube tu imagen
3. Copia el "Direct link"
4. Pégala en el campo "URL de Imagen"

### Opción 4: Tu Propio Servidor

Puedes subir imágenes a `/public/images/` y usar:
```
/images/mi-plato.jpg
```

## 🎯 Dónde Aparecen los Platos

Los platos destacados aparecen en:

1. **Homepage** - Sección "Nuestras Especialidades"
   - Carousel/slider automático
   - Visible para todos los visitantes
   - Carga automática desde la base de datos

2. **Panel Admin** - Vista de gestión
   - Vista previa con imagen
   - Controles de edición
   - Orden personalizable

## 🔧 Arquitectura Técnica

### Archivos Creados:

1. **Base de Datos**:
   - `supabase-featured-dishes-schema.sql` - Schema de la tabla

2. **API Routes**:
   - `app/api/featured-dishes/route.ts` - GET y POST
   - `app/api/featured-dishes/[id]/route.ts` - PUT y DELETE

3. **Páginas**:
   - `app/admin/platos-destacados/page.tsx` - Panel de admin

4. **Actualizaciones**:
   - `app/page.tsx` - Homepage actualizada para cargar desde DB
   - `components/admin/AdminNavbar.tsx` - Link agregado

### Flujo de Datos:

```
Homepage (app/page.tsx)
    ↓
    fetch('/api/featured-dishes')
    ↓
API Route (app/api/featured-dishes/route.ts)
    ↓
Supabase (tabla featured_dishes)
    ↓
Retorna platos activos ordenados
    ↓
Homepage muestra en carousel
```

## 📊 Estructura de la Tabla

```sql
featured_dishes (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price VARCHAR(50) NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## 🔒 Seguridad

- ✅ **Row Level Security (RLS)** habilitado
- ✅ Lectura pública: Solo platos activos (`is_active = true`)
- ✅ Escritura: Solo desde backend con Service Role Key
- ✅ Panel admin: Solo usuarios autenticados en `ADMIN_EMAILS`

## ⚡ Características Avanzadas

### Fallback Automático

Si la base de datos falla, la homepage muestra los platos hardcodeados originales:
- Buñuelos Artesanales
- Empanadas Caseras
- Papas Rellenas
- Arepas de Maíz
- Tamales Caseros

### Actualización en Tiempo Real

Los cambios en el panel admin se reflejan **inmediatamente** en la homepage al recargar la página.

### Optimización

- Índices en `is_active` y `display_order`
- Query ordenado para rendimiento
- Carga lazy de imágenes (Next.js Image)

## 🐛 Solución de Problemas

### No aparecen los platos en la homepage

1. Verifica que existan platos en Supabase:
   ```sql
   SELECT * FROM featured_dishes WHERE is_active = true;
   ```

2. Revisa la consola del navegador (F12)

3. Verifica que las variables de entorno estén configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Error al crear plato

1. Verifica que ejecutaste el script SQL
2. Revisa que la tabla `featured_dishes` existe:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name = 'featured_dishes';
   ```

### Imágenes no cargan

1. Verifica que la URL de la imagen sea pública y accesible
2. Prueba la URL en una pestaña nueva del navegador
3. Asegúrate de usar HTTPS, no HTTP

## 💡 Ejemplos de URLs de Imágenes Válidas

```
✅ https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/1.jpg
✅ https://res.cloudinary.com/demo/image/upload/sample.jpg
✅ https://i.ibb.co/abc123/plato.jpg
✅ /images/mi-plato.jpg (relativo a /public)

❌ C:/Users/Desktop/plato.jpg (ruta local - NO funciona)
❌ file:///imagen.jpg (protocolo file - NO funciona)
```

## 📈 Próximas Mejoras

Ideas para futuras versiones:

- [ ] Upload directo de imágenes desde el panel
- [ ] Ordenar con drag & drop
- [ ] Duplicar platos existentes
- [ ] Programar activación/desactivación por fecha
- [ ] Analytics de clicks en cada plato
- [ ] A/B testing de descripciones

## 🎓 Tutorial Rápido

### Escenario: Agregar "Bandeja Paisa Especial"

1. **Prepara tu imagen**:
   - Sube a Cloudinary/ImgBB
   - Copia la URL

2. **Ve al panel**:
   - http://localhost:3000/admin/platos-destacados

3. **Crea el plato**:
   ```
   Nombre: Bandeja Paisa Especial
   Descripción: La auténtica bandeja paisa con todos sus ingredientes...
   Precio: $32.000
   URL Imagen: https://tu-url.com/bandeja.jpg
   Orden: 1
   ```

4. **Guarda**:
   - Haz clic en "Crear"

5. **Verifica**:
   - Ve a http://localhost:3000
   - Busca el carousel
   - ¡Debería aparecer tu plato!

## ✅ Checklist de Configuración

- [ ] Ejecuté `supabase-featured-dishes-schema.sql` en Supabase
- [ ] Vi los 5 platos de ejemplo en la tabla
- [ ] Accedí a `/admin/platos-destacados`
- [ ] Puedo ver la lista de platos
- [ ] Creé un nuevo plato de prueba
- [ ] El plato aparece en la homepage
- [ ] Las imágenes cargan correctamente
- [ ] Puedo cambiar el orden de los platos
- [ ] Puedo activar/desactivar platos

---

**¡Listo para administrar tus platos destacados!** 🎉
