# Configuración de Autenticación con Facebook usando Clerk

Este documento explica cómo configurar la autenticación con Facebook para que los clientes puedan dejar reseñas verificadas en el sitio web del Restaurante Munay.

## Requisitos Previos

- Cuenta de Clerk (ya está configurada en el proyecto)
- Cuenta de Facebook Developer
- Acceso al panel de administración de Clerk

## Pasos para Configurar Facebook OAuth en Clerk

### 1. Crear una Aplicación en Facebook Developer

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Inicia sesión con tu cuenta de Facebook
3. Haz clic en **"Mis aplicaciones"** en el menú superior
4. Selecciona **"Crear aplicación"**
5. Elige el tipo **"Consumidor"** (para autenticación de usuarios)
6. Completa la información:
   - **Nombre de la aplicación**: Restaurante Munay
   - **Correo de contacto**: tu correo de administrador
7. Haz clic en **"Crear aplicación"**

### 2. Configurar Facebook Login

1. En el panel de tu aplicación, ve a **"Agregar producto"**
2. Busca **"Inicio de sesión con Facebook"** y haz clic en **"Configurar"**
3. Selecciona **"Web"** como plataforma
4. Ingresa la URL de tu sitio (por ahora puedes usar `http://localhost:3000` para desarrollo)
5. Guarda los cambios

### 3. Obtener las Credenciales de Facebook

1. En el panel lateral, ve a **"Configuración"** > **"Básica"**
2. Aquí encontrarás:
   - **ID de la aplicación** (App ID)
   - **Clave secreta de la aplicación** (App Secret) - haz clic en "Mostrar" para verla
3. Copia estas credenciales (las necesitarás en el siguiente paso)

### 4. Configurar Facebook OAuth en Clerk

1. Ve al [Panel de Clerk](https://dashboard.clerk.com/)
2. Selecciona tu aplicación (Restaurante Munay)
3. En el menú lateral, ve a **"User & Authentication"** > **"Social Connections"**
4. Busca **"Facebook"** y haz clic en el botón de configuración
5. Activa **"Enable Facebook"**
6. Ingresa las credenciales que copiaste:
   - **Facebook App ID**: Pega el ID de la aplicación
   - **Facebook App Secret**: Pega la clave secreta
7. Copia la **"Redirect URI"** que te proporciona Clerk (algo como `https://your-app.clerk.accounts.dev/v1/oauth_callback`)

### 5. Configurar la URI de Redirección en Facebook

1. Vuelve al panel de Facebook Developer
2. Ve a **"Inicio de sesión con Facebook"** > **"Configuración"**
3. En **"URI de redireccionamiento de OAuth válidos"**, pega la URI que copiaste de Clerk
4. Guarda los cambios

### 6. Configurar URLs Permitidas (para producción)

Cuando despliegues a producción:

1. En Facebook Developer, ve a **"Configuración"** > **"Básica"**
2. Agrega tu dominio de producción en:
   - **Dominios de la aplicación**: `restaurantpassionne.com` (o tu dominio real)
   - **URL de la política de privacidad**: Tu URL de política de privacidad
   - **URL de las condiciones del servicio**: Tu URL de términos
3. En **"Inicio de sesión con Facebook"** > **"Configuración"**:
   - Actualiza las URIs de redirección con tu dominio de producción

### 7. Hacer la Aplicación Pública

Por defecto, tu aplicación estará en modo de desarrollo. Para hacerla pública:

1. En el panel de Facebook, ve a **"Configuración"** > **"Básica"**
2. Desplázate hacia abajo y cambia el estado de la aplicación a **"En producción"**
3. Completa cualquier información requerida para la revisión de Facebook

## Variables de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno de Clerk:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Funcionalidades Implementadas

### Para Usuarios Regulares (Clientes)

1. **Autenticación con Facebook**: Los clientes pueden iniciar sesión con su cuenta de Facebook
2. **Reseñas Verificadas**: Las reseñas dejadas por usuarios autenticados muestran una marca de verificación azul ✓
3. **Autocompletar Información**: El nombre del usuario se llena automáticamente desde su perfil de Facebook
4. **Mayor Credibilidad**: Los visitantes verán que los comentarios provienen de cuentas reales de Facebook

### Para Administradores

Ya tienes implementado un panel completo de administración con las siguientes características:

1. **Gestión de Platos del Día**:
   - Agregar nuevos platos especiales
   - Editar platos existentes
   - Marcar platos como disponibles/no disponibles
   - Eliminar platos

2. **Acceso Protegido**:
   - Solo usuarios autenticados pueden acceder a `/admin`
   - El middleware de Clerk protege todas las rutas administrativas

3. **Funcionalidades Disponibles** (según tu panel):
   - Vista General (Dashboard)
   - Platos del Día (`/admin/daily-specials`)
   - Blog & Noticias (`/admin/blog`)
   - Gestión de Menú (`/admin/menu`)
   - Galería de Fotos (`/admin/gallery`)
   - Testimonios (`/admin/testimonials`)
   - Configuración (`/admin/settings`)

## Rutas del Sitio

- `/` - Página principal (pública)
- `/menu` - Menú del restaurante (pública)
- `/nosotros` - Sobre el restaurante (pública)
- `/blog` - Blog y noticias (pública)
- `/galeria` - Galería de fotos (pública)
- `/sign-in` - Iniciar sesión (para clientes y administradores)
- `/sign-up` - Crear cuenta (para clientes y administradores)
- `/admin` - Panel de administración (protegida - requiere autenticación)

## Verificación de la Configuración

Para verificar que todo funciona correctamente:

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000`
3. Desplázate hasta la sección **"Lo Que Dicen Nuestros Clientes"**
4. Haz clic en **"Dejar una Reseña"**
5. Deberías ver un botón **"Iniciar Sesión"**
6. Al hacer clic, serás redirigido a la página de sign-in de Clerk
7. Deberías ver opciones para iniciar sesión con:
   - Facebook (botón azul con el logo de Facebook)
   - Email y contraseña
   - Otras opciones que hayas configurado en Clerk

## Consideraciones de Seguridad

1. **Nunca compartas** tus claves secretas de Facebook o Clerk
2. **No subas** las claves a repositorios públicos de Git
3. **Usa variables de entorno** para todas las credenciales
4. **Revisa periódicamente** los permisos de tu aplicación de Facebook
5. **Mantén actualizadas** las dependencias de Clerk

## Solución de Problemas

### El botón de Facebook no aparece

1. Verifica que habilitaste Facebook en Clerk Dashboard
2. Revisa que las credenciales de Facebook estén correctamente configuradas
3. Limpia la caché del navegador y recarga la página

### Error de redirección

1. Verifica que la URI de redirección en Facebook coincida exactamente con la de Clerk
2. Asegúrate de que el dominio esté en la lista de dominios permitidos en Facebook

### La aplicación de Facebook está en modo de desarrollo

Para pruebas, puedes agregar usuarios de prueba en Facebook Developer > Roles > Usuarios de prueba

## Recursos Adicionales

- [Documentación de Clerk](https://clerk.com/docs)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Clerk Social Connections](https://clerk.com/docs/authentication/social-connections/facebook)

## Soporte

Si tienes problemas con la configuración, contacta a:

- Soporte de Clerk: https://clerk.com/support
- Facebook Developer Support: https://developers.facebook.com/support
