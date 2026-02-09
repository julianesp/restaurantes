# Buzón de Sugerencias - Instrucciones de Instalación

## ✅ Archivos Creados

### 1. Base de Datos
- `supabase-suggestions-schema.sql` - Schema de la tabla de sugerencias

### 2. API Endpoints
- `app/api/suggestions/route.ts` - GET (listar) y POST (crear sugerencias)
- `app/api/suggestions/[id]/route.ts` - PATCH (actualizar) y DELETE (eliminar)

### 3. Componentes Frontend
- `components/SuggestionBox.tsx` - Botón flotante y formulario modal
- `app/admin/sugerencias/page.tsx` - Panel de administración

### 4. Integración
- `app/layout.tsx` - Actualizado para incluir el componente en todas las páginas

## 🚀 Pasos para Activar

### Paso 1: Ejecutar el Schema en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a la sección **SQL Editor** en el menú lateral
4. Copia y pega el contenido del archivo `supabase-suggestions-schema.sql`
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- ✅ Tabla `customer_suggestions` con todos los campos necesarios
- ✅ Índices para mejorar el rendimiento
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers para actualizar timestamps automáticamente

### Paso 2: Verificar la Instalación

Ejecuta esta query en Supabase SQL Editor para verificar:

```sql
SELECT * FROM customer_suggestions;
```

Si no da error, ¡la tabla está lista!

### Paso 3: Probar la Funcionalidad

1. **Frontend (Usuario):**
   - Abre tu sitio web
   - Deberías ver un botón flotante "Sugerencias" en la esquina inferior derecha
   - Haz clic y prueba enviar una sugerencia
   - Puedes dejarlo anónimo o con tus datos

2. **Backend (Admin):**
   - Inicia sesión como administrador
   - Ve a: `tu-dominio.com/admin/sugerencias`
   - Deberías ver las sugerencias recibidas
   - Puedes filtrarlas, marcarlas como leídas, agregar notas internas

## 📋 Características

### Para los Clientes:
- ✅ Buzón completamente privado
- ✅ Pueden dejar comentarios anónimos o con sus datos
- ✅ Sistema de calificación de 1-5 estrellas
- ✅ Categorías: General, Comida, Servicio, Ambiente, Queja, Felicitación
- ✅ Interfaz moderna y fácil de usar
- ✅ Botón flotante siempre visible

### Para Administradores:
- ✅ Panel completo de administración
- ✅ Filtros por tipo y estado (leído/sin leer)
- ✅ Marcar como leída automáticamente
- ✅ Agregar notas internas
- ✅ Ver información de contacto (si el cliente la proporcionó)
- ✅ Eliminar sugerencias
- ✅ Contador de sugerencias sin leer

## 🔒 Seguridad

- **Row Level Security (RLS)** activado
- Cualquiera puede **enviar** sugerencias (público)
- Solo usuarios **autenticados** pueden **ver, actualizar y eliminar** (admins)
- Las políticas de Supabase protegen los datos automáticamente

## 🎨 Personalización

Si quieres personalizar el diseño:

1. **Colores del botón:** Edita `components/SuggestionBox.tsx:104`
2. **Posición del botón:** Edita las clases `bottom-6 right-6` en la línea 104
3. **Campos del formulario:** Agrega o elimina campos en el componente
4. **Tipos de sugerencias:** Edita el select en línea 233

## 📱 Responsive

El buzón está completamente optimizado para:
- ✅ Desktop
- ✅ Tablet
- ✅ Móvil

## 🔔 Próximas Mejoras (Opcional)

Si deseas implementar en el futuro:

1. **Notificaciones:** Enviar email al admin cuando llegue una nueva sugerencia
2. **Respuestas:** Sistema para responder directamente al cliente por email
3. **Estadísticas:** Dashboard con gráficos de tipos de sugerencias
4. **Exportar:** Botón para exportar sugerencias a CSV/Excel
5. **Búsqueda:** Buscador de texto en las sugerencias

## 🆘 Soporte

Si tienes algún problema:
1. Verifica que las variables de entorno de Supabase estén configuradas en `.env.local`
2. Revisa los logs del navegador (F12) para errores
3. Verifica los logs de Supabase en el dashboard

## ✨ ¡Listo!

El buzón de sugerencias está completamente funcional y listo para recibir comentarios de tus clientes.
