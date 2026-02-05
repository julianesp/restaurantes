# Configuración del Panel de Administración - Restaurante Munay

## 📋 Sistema de Autenticación con Clerk

El panel de administración utiliza **Clerk** para gestionar la autenticación de usuarios. Esto permite que solo personal autorizado pueda:
- Agregar platos del día
- Publicar en el blog
- Gestionar el menú
- Subir fotos a la galería
- Moderar testimonios

---

## 🚀 Configuración Inicial (IMPORTANTE)

### Paso 1: Crear Cuenta en Clerk

1. Ve a [https://clerk.com](https://clerk.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación con el nombre "Restaurante Munay"
4. Selecciona "Next.js" como framework

### Paso 2: Obtener las API Keys

En el dashboard de Clerk:
1. Ve a **API Keys** en el menú lateral
2. Copia el **Publishable Key** (comienza con `pk_test_...`)
3. Copia el **Secret Key** (comienza con `sk_test_...`)

### Paso 3: Configurar Variables de Entorno

1. En el proyecto, crea un archivo `.env.local` (si no existe)
2. Agrega las siguientes variables:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_key_aqui
CLERK_SECRET_KEY=sk_test_tu_key_aqui

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

**⚠️ IMPORTANTE:**
- Nunca compartas estas keys públicamente
- No las subas a GitHub
- El archivo `.env.local` ya está en `.gitignore`

### Paso 4: Configurar el Idioma en Español (Opcional)

Las páginas de sign-in/sign-up ya están configuradas en español automáticamente.

---

## 👥 Crear el Primer Administrador

### Opción 1: Registro Directo

1. Ejecuta el proyecto: `npm run dev`
2. Ve a: `http://localhost:3000/sign-up`
3. Registra tu cuenta de administrador
4. Verifica tu email
5. Inicia sesión en: `http://localhost:3000/sign-in`
6. Accede al panel: `http://localhost:3000/admin`

### Opción 2: Desde el Dashboard de Clerk

1. En el dashboard de Clerk, ve a **Users**
2. Click en **Create User**
3. Ingresa email y contraseña
4. El usuario podrá iniciar sesión directamente

---

## 🔐 Rutas Protegidas

Las siguientes rutas requieren autenticación:

- `/admin` - Dashboard principal
- `/admin/daily-specials` - Gestión de platos del día
- `/admin/blog` - Gestión del blog
- `/admin/menu` - Gestión del menú (próximamente)
- `/admin/gallery` - Gestión de galería (próximamente)
- `/admin/testimonials` - Gestión de testimonios (próximamente)
- `/admin/settings` - Configuración (próximamente)

---

## 📱 Funcionalidades del Panel de Administración

### 1. Dashboard Principal (`/admin`)

Vista general con:
- Estadísticas rápidas
- Acceso a todas las secciones
- Información del usuario logueado
- Botón para ver el sitio público

### 2. Platos del Día (`/admin/daily-specials`)

Permite:
- ✅ Agregar nuevos platos especiales
- ✅ Editar platos existentes
- ✅ Marcar como disponible/no disponible
- ✅ Eliminar platos
- ✅ Ver historial de platos creados

**Campos:**
- Nombre del plato
- Descripción
- Precio
- Categoría (Desayuno, Almuerzo, Cena, Postre)

### 3. Blog & Noticias (`/admin/blog`)

Permite:
- ✅ Crear nuevas publicaciones
- ✅ Editar publicaciones existentes
- ✅ Publicar/despublicar artículos
- ✅ Organizar por categorías:
  - Platos Especiales
  - Noticias
  - Recetas
  - Eventos
- ✅ Agregar tags
- ✅ Eliminar publicaciones

**Campos:**
- Título
- Categoría
- Tags (separados por coma)
- Resumen breve
- Contenido completo

---

## 🎨 Características del Sistema

### Seguridad
- ✅ Autenticación segura con Clerk
- ✅ Rutas protegidas con middleware
- ✅ Solo usuarios autenticados pueden acceder al admin
- ✅ Sesiones persistentes
- ✅ Cierre de sesión seguro

### Interfaz
- ✅ Diseño moderno y responsive
- ✅ Modo oscuro/claro
- ✅ Feedback visual en acciones
- ✅ Formularios validados
- ✅ Confirmaciones antes de eliminar

### Experiencia de Usuario
- ✅ Navegación intuitiva
- ✅ Acceso rápido al sitio público
- ✅ Vista previa del contenido
- ✅ Estadísticas en tiempo real

---

## 🔧 Mantenimiento y Soporte

### Agregar Más Administradores

**Método 1: Desde Clerk Dashboard**
1. Ir a Users en Clerk
2. Create User
3. Enviar invitación por email

**Método 2: Compartir Link de Registro**
1. Compartir: `https://tudominio.com/sign-up`
2. El nuevo admin se registra
3. Verificar email y acceder

### Eliminar Acceso de Administrador

1. Ir al dashboard de Clerk
2. Users → Seleccionar usuario
3. Delete User o Block User

### Restablecer Contraseña

1. En la página de sign-in
2. Click en "Forgot password?"
3. Seguir instrucciones del email

---

## 🆘 Solución de Problemas

### Error: "Invalid publishable key"
**Solución:** Verifica que copiaste correctamente las keys de Clerk en `.env.local`

### No puedo acceder a `/admin`
**Solución:**
1. Asegúrate de haber iniciado sesión
2. Verifica que las variables de entorno estén configuradas
3. Reinicia el servidor de desarrollo

### La página de sign-in no carga
**Solución:**
1. Verifica que Clerk esté correctamente instalado: `npm list @clerk/nextjs`
2. Revisa que las keys estén en `.env.local`
3. Reinicia el servidor

---

## 📊 Datos de Ejemplo

El sistema viene con datos de ejemplo para:
- 2 platos del día
- 1 publicación de blog

**IMPORTANTE:** Estos son solo ejemplos. Debes agregar el contenido real del restaurante.

---

## 🔮 Próximas Funcionalidades (En Desarrollo)

- [ ] Gestión completa del menú
- [ ] Subida de imágenes a la galería
- [ ] Moderación de testimonios
- [ ] Configuración del restaurante (horarios, ubicación, etc.)
- [ ] Estadísticas de visitas
- [ ] Gestión de pedidos online

---

## 📞 Soporte Técnico

Para cualquier problema técnico o consulta:
**Julián España** - Desarrollador
- Ubicación: Valle de Sibundoy, Putumayo

---

## ✅ Checklist de Configuración

Antes de lanzar el panel de administración en producción:

- [ ] Crear cuenta en Clerk
- [ ] Configurar variables de entorno
- [ ] Crear primer usuario administrador
- [ ] Probar inicio de sesión
- [ ] Probar agregar plato del día
- [ ] Probar publicar en blog
- [ ] Verificar que rutas públicas siguen accesibles
- [ ] Probar cierre de sesión
- [ ] Documentar credenciales de forma segura

---

**Restaurante Munay** - Panel de Administración v1.0
Enero 2026
