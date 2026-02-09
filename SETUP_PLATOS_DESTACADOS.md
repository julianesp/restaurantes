# 🚀 Setup Platos Destacados Homepage

## ✅ Qué se Creó

He creado un **sistema completo** para gestionar los platos que aparecen en el carousel de la homepage desde el panel de administración.

### Archivos Creados:

1. **Base de Datos**:
   - ✅ `supabase-featured-dishes-schema.sql`

2. **API Routes**:
   - ✅ `app/api/featured-dishes/route.ts`
   - ✅ `app/api/featured-dishes/[id]/route.ts`

3. **Panel de Admin**:
   - ✅ `app/admin/platos-destacados/page.tsx`

4. **Actualizaciones**:
   - ✅ `app/page.tsx` - Homepage carga desde DB
   - ✅ `components/admin/AdminNavbar.tsx` - Link agregado

5. **Documentación**:
   - ✅ `PLATOS_DESTACADOS_README.md`

## 🎯 Pasos para Activarlo (3 minutos)

### 1️⃣ Ejecutar Script SQL en Supabase

**Abre**: https://app.supabase.com/project/vweicjimlsyquivgcoln/sql/new

**Ejecuta**:
1. Copia TODO el contenido de: `supabase-featured-dishes-schema.sql`
2. Pega en Supabase SQL Editor
3. Haz clic en **RUN**

Esto creará:
- Tabla `featured_dishes`
- 5 platos de ejemplo (los actuales del código)
- Índices y triggers
- Políticas de seguridad

### 2️⃣ Verificar la Instalación

```sql
SELECT * FROM featured_dishes ORDER BY display_order;
```

Deberías ver 5 platos:
1. Buñuelos Artesanales
2. Empanadas Caseras
3. Papas Rellenas
4. Arepas de Maíz
5. Tamales Caseros

### 3️⃣ Acceder al Panel de Admin

1. Ve a: http://localhost:3000/admin
2. Haz clic en **"Platos Destacados"** (icono ⭐)
3. O directo: http://localhost:3000/admin/platos-destacados

### 4️⃣ Crear tu Primer Plato

1. Haz clic en **"Nuevo Plato Destacado"**
2. Llena el formulario:
   - Nombre: "Bandeja Paisa"
   - Descripción: "Deliciosa bandeja paisa con todos los ingredientes..."
   - Precio: "$32.000"
   - URL Imagen: (pega una URL pública de imagen)
   - Orden: 6
3. Haz clic en **"Crear"**

### 5️⃣ Verificar en Homepage

1. Ve a: http://localhost:3000
2. Busca la sección "Nuestras Especialidades"
3. ¡Deberías ver tus platos en el carousel!

## ✨ Funcionalidades Disponibles

### En el Panel Admin:

- ✅ **Crear** nuevos platos destacados
- ✅ **Editar** nombre, descripción, precio, imagen
- ✅ **Eliminar** platos (con confirmación)
- ✅ **Cambiar orden** con flechas ⬆️⬇️
- ✅ **Activar/Desactivar** sin eliminar
- ✅ **Vista previa** con imagen

### En la Homepage:

- ✅ **Carga automática** desde la base de datos
- ✅ **Carousel/slider** con los platos activos
- ✅ **Fallback** a platos hardcodeados si falla la carga
- ✅ **Responsive** y optimizado

## 🖼️ Cómo Subir Imágenes

### Opción 1: Cloudinary (Gratis)

1. Crea cuenta: https://cloudinary.com
2. Sube tu imagen
3. Copia la URL pública
4. Pégala en "URL de Imagen"

### Opción 2: ImgBB (Gratis)

1. Ve a: https://imgbb.com
2. Sube tu imagen
3. Copia "Direct link"
4. Pégala en "URL de Imagen"

### Opción 3: Usar las URLs de Ejemplo

Ya hay URLs de ejemplo en el sistema:
```
https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/1.jpg
https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/2.jpg
...hasta /5.jpg
```

## 🔍 Estructura de la Tabla

```sql
featured_dishes:
  - id (UUID, PK)
  - name (VARCHAR, NOT NULL)
  - description (TEXT, NOT NULL)
  - price (VARCHAR, NOT NULL)
  - image_url (TEXT, nullable)
  - display_order (INTEGER, default 0)
  - is_active (BOOLEAN, default true)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## 🎨 Capturas de Funcionalidades

### Panel de Administración:
- Lista de todos los platos con vista previa
- Formulario lateral para crear/editar
- Botones de orden (subir/bajar)
- Toggle activo/inactivo
- Botones de editar y eliminar

### Homepage:
- Carousel automático
- Imágenes optimizadas
- Descripciones completas
- Precios destacados

## ⚠️ Notas Importantes

1. **Solo administradores** pueden acceder al panel
   - Configurado en `.env.local` → `ADMIN_EMAILS`

2. **Row Level Security (RLS)** activo
   - Lectura pública: Solo platos activos
   - Escritura: Solo desde backend (Service Role Key)

3. **Fallback automático**
   - Si falla la carga desde DB, muestra platos hardcodeados
   - Asegura que siempre haya contenido

4. **Actualización en tiempo real**
   - Los cambios en admin se ven al recargar la homepage

## 🐛 Solución de Problemas

### Error: "relation featured_dishes does not exist"
**Solución**: No ejecutaste el script SQL. Ve al Paso 1.

### No aparecen platos en homepage
**Solución**:
1. Verifica que existan platos activos en Supabase
2. Revisa la consola del navegador (F12)
3. Asegúrate de tener variables de entorno configuradas

### Error al crear plato
**Solución**:
1. Completa todos los campos requeridos (*)
2. Verifica que la tabla existe en Supabase
3. Revisa permisos de Service Role Key

### Imágenes no cargan
**Solución**:
1. Verifica que la URL sea pública y accesible
2. Usa HTTPS, no HTTP
3. Prueba la URL en una pestaña nueva

## ✅ Checklist de Verificación

- [ ] Ejecuté el script SQL en Supabase
- [ ] Vi los 5 platos de ejemplo en la tabla
- [ ] Accedí a `/admin/platos-destacados`
- [ ] Veo la lista de platos en el admin
- [ ] Creé un plato de prueba
- [ ] El plato aparece en la homepage
- [ ] Las imágenes cargan correctamente
- [ ] Puedo editar un plato
- [ ] Puedo cambiar el orden
- [ ] Puedo activar/desactivar
- [ ] Puedo eliminar un plato

## 📚 Documentación Completa

Lee `PLATOS_DESTACADOS_README.md` para:
- Tutorial completo de uso
- Arquitectura técnica
- Ejemplos avanzados
- API endpoints
- Próximas mejoras

## 🎉 ¡Listo!

Una vez ejecutes el script SQL, podrás:
- Gestionar platos desde el admin
- Sin tocar código nunca más
- Actualizar la homepage fácilmente
- Subir nuevas imágenes
- Cambiar precios y descripciones

---

**Tiempo total de setup: 3 minutos**
**Dificultad: Principiante** ⭐
