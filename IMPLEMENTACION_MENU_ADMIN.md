# Implementación del Panel de Administración y Sistema de Menú

## 📋 Resumen

Se ha implementado un sistema completo de gestión de menú con panel de administración y persistencia de datos usando Supabase. El sistema incluye:

- ✅ Backend con Supabase (PostgreSQL)
- ✅ API REST para CRUD de menú
- ✅ Panel de administración protegido
- ✅ Descarga de menú en PDF
- ✅ Migración de datos existentes
- ✅ Protección de rutas con middleware

---

## 🚀 Pasos de Configuración

### 1. Configurar Supabase

#### Crear Proyecto en Supabase
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales

#### Configurar Variables de Entorno
Copia las credenciales a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

⚠️ **Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY` públicamente.**

#### Crear las Tablas
1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Abre el archivo `supabase-schema.sql`
3. Copia y pega todo el contenido
4. Ejecuta el script haciendo clic en **Run**

Esto creará:
- Tabla `menu_categories` (categorías del menú)
- Tabla `menu_items` (items del menú)
- Índices para optimización
- Políticas RLS para seguridad
- Triggers para actualización automática de fechas

### 2. Migrar Datos Existentes

#### Opción A: Usando el Script de Migración
```bash
# Asegúrate de tener las variables de entorno configuradas
npm install ts-node -g
npx ts-node scripts/migrate-menu-data.ts
```

#### Opción B: Desde el Panel Admin
1. Ve a `/admin` en tu navegador
2. Inicia sesión con una cuenta de administrador
3. Navega a "Gestión de Menú"
4. Crea manualmente las categorías e items

### 3. Verificar Instalación

Verifica que todo esté funcionando:

```bash
# Instalar dependencias (si aún no lo hiciste)
npm install

# Ejecutar en desarrollo
npm run dev
```

Luego visita:
- `http://localhost:3000/menu` - Ver el menú público
- `http://localhost:3000/admin` - Panel de administración
- `http://localhost:3000/admin/menu` - Gestión de menú

---

## 📁 Estructura de Archivos Creados

```
/lib
  └── supabase.ts                    # Cliente de Supabase

/app/api/menu
  ├── categories
  │   ├── route.ts                   # GET (público), POST (admin)
  │   └── [id]
  │       └── route.ts               # PUT, DELETE (admin)
  ├── items
  │   ├── route.ts                   # GET (público), POST (admin)
  │   └── [id]
  │       └── route.ts               # PUT, DELETE (admin)
  ├── full
  │   └── route.ts                   # GET menú completo (público)
  └── download
      └── route.ts                   # GET descarga PDF (público)

/app/menu
  ├── page.tsx                       # Página principal del menú (Server Component)
  └── MenuClient.tsx                 # Cliente interactivo del menú

/app/admin/menu
  └── page.tsx                       # Panel CRUD de menú (protegido)

/scripts
  └── migrate-menu-data.ts           # Script de migración de datos

/
├── middleware.ts                    # Protección de rutas admin
├── supabase-schema.sql              # Schema de base de datos
├── SUPABASE_SETUP.md                # Guía de configuración
└── IMPLEMENTACION_MENU_ADMIN.md     # Este documento
```

---

## 🔒 Seguridad

### Protección de Rutas
- **Middleware**: Protege todas las rutas `/admin/*` y API writes
- **Verificación de Email**: Solo los emails en `ADMIN_EMAILS` pueden acceder al panel
- **RLS en Supabase**: Row Level Security protege las tablas
- **Service Role Key**: Solo el backend puede escribir datos

### Niveles de Acceso
1. **Público**: Puede ver el menú y descargar PDF
2. **Autenticado**: Puede iniciar sesión
3. **Admin**: Puede gestionar el menú (definido en `ADMIN_EMAILS`)

---

## 🎯 Funcionalidades

### Para Usuarios Públicos
- ✅ Ver menú organizado por categorías
- ✅ Ver precios y descripciones
- ✅ Ver badges (vegetariano, picante)
- ✅ Agregar items al carrito
- ✅ Descargar menú en PDF

### Para Administradores
- ✅ Crear, editar y eliminar categorías
- ✅ Crear, editar y eliminar items del menú
- ✅ Cambiar orden de visualización
- ✅ Marcar items como vegetarianos o picantes
- ✅ Activar/desactivar items
- ✅ Gestión visual e intuitiva

---

## 🔄 Flujo de Datos

```
Cliente → Next.js Server → Supabase (PostgreSQL)
   ↓
   └→ API Routes (/api/menu/*)
        ├→ GET: Supabase client (anon key) - Público
        └→ POST/PUT/DELETE: Supabase admin (service role) - Solo admin
```

### Lectura (GET)
1. Usuario visita `/menu`
2. Server Component llama a `/api/menu/full`
3. API usa `supabase` client (anon key)
4. RLS permite lectura de items activos
5. Datos se envían al cliente

### Escritura (POST/PUT/DELETE)
1. Admin hace cambios en `/admin/menu`
2. Middleware verifica autenticación
3. API verifica email en `ADMIN_EMAILS`
4. API usa `supabaseAdmin` (service role key)
5. Datos se escriben directamente (bypass RLS)

---

## 📊 Schema de Base de Datos

### menu_categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR(100) | Nombre de la categoría |
| slug | VARCHAR(100) | Identificador único |
| icon | VARCHAR(50) | Nombre del ícono |
| color | VARCHAR(50) | Clase de color |
| display_order | INTEGER | Orden de visualización |
| is_active | BOOLEAN | Estado activo/inactivo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### menu_items
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary Key |
| category_id | UUID | Foreign Key → menu_categories |
| name | VARCHAR(200) | Nombre del plato |
| description | TEXT | Descripción |
| price | VARCHAR(50) | Precio (formato texto) |
| is_vegetarian | BOOLEAN | Es vegetariano |
| is_spicy | BOOLEAN | Es picante |
| is_available | BOOLEAN | Está disponible |
| display_order | INTEGER | Orden de visualización |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

---

## 🛠️ API Endpoints

### Público (GET)
- `GET /api/menu/categories` - Obtener categorías activas
- `GET /api/menu/items` - Obtener items disponibles
- `GET /api/menu/items?category_id=xxx` - Filtrar por categoría
- `GET /api/menu/full` - Menú completo estructurado
- `GET /api/menu/download` - Descargar PDF

### Admin (POST/PUT/DELETE)
- `POST /api/menu/categories` - Crear categoría
- `PUT /api/menu/categories/:id` - Actualizar categoría
- `DELETE /api/menu/categories/:id` - Eliminar categoría
- `POST /api/menu/items` - Crear item
- `PUT /api/menu/items/:id` - Actualizar item
- `DELETE /api/menu/items/:id` - Eliminar item

---

## 🐛 Troubleshooting

### Error: "No autenticado" al acceder a /admin
**Solución**: Verifica que hayas iniciado sesión con Clerk

### Error: "No autorizado" en el panel admin
**Solución**: Asegúrate de que tu email esté en la variable `ADMIN_EMAILS` en `.env.local`

### Error al cargar el menú
**Solución**:
1. Verifica las variables de Supabase en `.env.local`
2. Asegúrate de haber ejecutado el script SQL
3. Verifica que haya datos en las tablas

### PDF no se descarga
**Solución**:
1. Verifica que `jspdf` y `jspdf-autotable` estén instalados
2. Revisa la consola del navegador para errores
3. Asegúrate de que haya datos en el menú

### Error: "Module not found: @/lib/supabase"
**Solución**: Verifica que el archivo `lib/supabase.ts` exista

---

## 📝 Mantenimiento

### Agregar un Nuevo Admin
1. Abre `.env.local`
2. Agrega el email a `ADMIN_EMAILS`:
```env
ADMIN_EMAILS=admin1@ejemplo.com,admin2@ejemplo.com,nuevo@ejemplo.com
```
3. Reinicia el servidor

### Backup de la Base de Datos
En Supabase dashboard:
1. Ve a Database → Backups
2. Configura backups automáticos
3. O descarga un backup manual

### Actualizar Precios
1. Ve a `/admin/menu`
2. Selecciona la categoría
3. Haz clic en el ícono de editar del item
4. Actualiza el precio
5. Guarda los cambios

---

## 🎨 Personalización

### Cambiar Colores del PDF
Edita `app/api/menu/download/route.ts`:
```typescript
headStyles: {
  fillColor: [220, 38, 38], // Cambia estos valores RGB
  // ...
}
```

### Agregar Nuevos Íconos
1. Importa el ícono en `app/menu/MenuClient.tsx`
2. Agrégalo al objeto `iconMap`
3. Usa el nombre del ícono al crear categorías

### Cambiar Estructura del PDF
Edita `app/api/menu/download/route.ts` para personalizar:
- Títulos y encabezados
- Columnas de la tabla
- Estilos y colores
- Footer y numeración

---

## 🚦 Próximos Pasos

### Funcionalidades Pendientes (Fase 2)
- [ ] Fotos profesionales de platos
- [ ] Email corporativo
- [ ] Enlaces a redes sociales
- [ ] Gestión de imágenes de platos
- [ ] Categorías con imágenes
- [ ] Sistema de ofertas/descuentos
- [ ] Horarios de disponibilidad por plato

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador
2. Revisa los logs del servidor
3. Consulta la [documentación de Supabase](https://supabase.com/docs)
4. Consulta la [documentación de Clerk](https://clerk.com/docs)

---

## ✅ Checklist de Implementación

Antes de pasar a producción, verifica:

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Tablas creadas en Supabase
- [ ] Datos migrados correctamente
- [ ] Admin puede iniciar sesión
- [ ] Admin puede crear/editar/eliminar items
- [ ] Menú público se muestra correctamente
- [ ] Descarga de PDF funciona
- [ ] Middleware protege rutas correctamente
- [ ] Variables de entorno configuradas en Vercel/producción
- [ ] `NEXT_PUBLIC_BASE_URL` apunta a la URL de producción

---

Implementado el: 2026-01-31
Versión: 1.0
