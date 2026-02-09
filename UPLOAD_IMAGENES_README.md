# 📸 Sistema de Upload de Imágenes

## ✨ Nueva Funcionalidad

Ahora puedes **subir imágenes directamente** desde tu celular o computador al crear/editar platos destacados. Ya no necesitas URLs externas.

## 🚀 Cómo Usar

### Desde el Panel de Admin

1. Ve a: **Admin → Platos Destacados**
2. Haz clic en **"Nuevo Plato Destacado"** o edita uno existente
3. En la sección "Imagen del Plato":
   - **Opción 1**: Haz clic en "Subir desde dispositivo"
   - **Opción 2**: Pega una URL externa

### Subir Imagen desde Dispositivo

1. **Haz clic** en el área de "Subir desde dispositivo"
2. **Selecciona** una foto de tu galería o toma una nueva
3. **Espera** a que se suba (verás "Subiendo...")
4. **¡Listo!** La imagen se guardará automáticamente

### Especificaciones de Imagen

- **Formatos aceptados**: JPEG, JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5 MB
- **Recomendación**: 1200x800px para mejor calidad
- **Orientación**: Horizontal (landscape) preferible

## 📱 Desde el Celular

### Paso a Paso

1. Abre el navegador en tu celular
2. Ve a: `http://localhost:3000/admin/platos-destacados`
   - O la URL de tu servidor en producción
3. Inicia sesión como admin
4. Haz clic en "Nuevo Plato Destacado"
5. Toca "Subir desde dispositivo"
6. Elige:
   - **Tomar foto** (abre la cámara)
   - **Seleccionar de galería**

### Consejos para Mejores Fotos

📸 **Toma buenas fotos de tus platos**:

1. **Iluminación**:
   - Usa luz natural siempre que sea posible
   - Evita sombras duras
   - No uses flash directo

2. **Composición**:
   - Centra el plato
   - Incluye el plato completo
   - Usa un fondo limpio y simple

3. **Ángulo**:
   - 45 grados es ideal para la mayoría de platos
   - Vista cenital (desde arriba) para pizzas, paellas
   - Vista frontal para hamburguesas, sándwiches

4. **Edición Básica** (opcional):
   - Aumenta ligeramente el brillo
   - Ajusta contraste si está muy plano
   - Recorta para centrar el plato

## 🗂️ Dónde se Guardan las Imágenes

### Ubicación en el Servidor

```
/public/uploads/featured-dishes/
```

Las imágenes se guardan con nombres únicos (UUID) para evitar conflictos:
```
abc123e4-5678-9def-0123-456789abcdef.jpg
```

### URL Pública

Una vez subida, la imagen está disponible en:
```
/uploads/featured-dishes/nombre-unico.jpg
```

Ejemplo:
```
http://localhost:3000/uploads/featured-dishes/abc123e4-5678-9def-0123-456789abcdef.jpg
```

## 🔧 Configuración Técnica

### API Endpoint

**POST** `/api/upload-image`

```typescript
// Request
FormData {
  file: File
}

// Response
{
  success: true,
  url: "/uploads/featured-dishes/abc123.jpg",
  filename: "abc123.jpg"
}
```

### Validaciones

1. **Tipo de archivo**:
   ```typescript
   ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
   ```

2. **Tamaño máximo**:
   ```typescript
   5 * 1024 * 1024 // 5MB
   ```

3. **Nombre único**:
   ```typescript
   randomUUID() + '.' + fileExtension
   ```

## 🛡️ Seguridad

### Validaciones Implementadas

✅ Solo imágenes (MIME type check)
✅ Tamaño máximo de 5MB
✅ Nombres únicos (UUID)
✅ Directorio dedicado y aislado
✅ No se permiten extensiones peligrosas

### Control de Acceso

- Solo **administradores autenticados** pueden subir imágenes
- Validación en frontend y backend
- Archivos guardados fuera del código fuente

## 📦 Gestión de Almacenamiento

### Limpiar Imágenes Antiguas

Si necesitas eliminar imágenes viejas manualmente:

```bash
# Ver imágenes
ls -lh public/uploads/featured-dishes/

# Eliminar una imagen específica
rm public/uploads/featured-dishes/abc123.jpg

# Eliminar todas (¡cuidado!)
rm public/uploads/featured-dishes/*.jpg
```

### Backup de Imágenes

Recomendado hacer backup periódico:

```bash
# Crear backup
tar -czf imagenes-backup-$(date +%Y%m%d).tar.gz public/uploads/

# Restaurar backup
tar -xzf imagenes-backup-20250208.tar.gz
```

## 🌐 En Producción

### Vercel / Netlify

⚠️ **Importante**: En estos servicios, los archivos subidos se **borran** cada vez que haces deploy.

**Soluciones**:

1. **Usar servicio externo** (Recomendado):
   - Cloudinary (Gratis hasta 25GB)
   - ImgBB (Gratis)
   - AWS S3
   - Google Cloud Storage

2. **Vercel Blob Storage**:
   ```bash
   npm install @vercel/blob
   ```

3. **Base de datos** (para imágenes pequeñas):
   - Convertir a Base64
   - Guardar en Supabase

### Migrar a Cloudinary

Si decides usar Cloudinary más adelante:

1. Crea cuenta: https://cloudinary.com
2. Instala SDK:
   ```bash
   npm install cloudinary
   ```
3. Actualiza `/api/upload-image/route.ts`
4. Las imágenes existentes seguirán funcionando

## 🐛 Solución de Problemas

### Error: "El archivo es muy grande"

**Solución**: La imagen supera 5MB

1. Comprime la imagen:
   - TinyPNG: https://tinypng.com
   - Compressor.io: https://compressor.io
2. O usa una resolución menor (1200x800 es suficiente)

### Error: "Tipo de archivo no permitido"

**Solución**: Solo se aceptan imágenes

1. Verifica que sea JPG, PNG, WebP o GIF
2. Si tomaste screenshot, guárdalo como JPG
3. No subas archivos PDF, Word, etc.

### La imagen no se ve

**Solución**:

1. Recarga la página (Ctrl+R)
2. Verifica que la imagen se guardó:
   ```bash
   ls public/uploads/featured-dishes/
   ```
3. Revisa la consola del navegador (F12)

### Error al subir desde celular

**Solución**:

1. Verifica que estés en HTTPS (en producción)
2. Da permisos de cámara/galería al navegador
3. Comprime la imagen si es muy grande
4. Intenta con otra imagen

## 📊 Límites y Recomendaciones

### Límites Actuales

- **Tamaño por imagen**: 5 MB
- **Formatos**: JPEG, PNG, WebP, GIF
- **Cantidad**: Sin límite (pero considera espacio en disco)

### Recomendaciones de Uso

1. **Comprime imágenes** antes de subir
   - Usa herramientas como TinyPNG
   - Reduce resolución a 1200x800

2. **Usa WebP** cuando sea posible
   - Mejor compresión que JPG
   - Soporte moderno en navegadores

3. **Nombra tus archivos** descriptivamente antes de subir
   - `bandeja-paisa.jpg` mejor que `IMG_1234.jpg`
   - Aunque el sistema generará nombre único

4. **Elimina platos viejos**
   - Las imágenes de platos eliminados quedan en disco
   - Limpia periódicamente

## ✅ Checklist de Upload

- [ ] La foto está bien iluminada
- [ ] El plato está centrado
- [ ] La imagen es menor a 5MB
- [ ] Formato es JPG, PNG o WebP
- [ ] Probé el upload desde admin
- [ ] La imagen se ve en el formulario
- [ ] Guardé el plato destacado
- [ ] Verifiqué en la homepage que se ve bien

## 💡 Tips Pro

### Optimizar Imágenes antes de Subir

**macOS/Linux**:
```bash
# Redimensionar con ImageMagick
convert input.jpg -resize 1200x800 -quality 85 output.jpg
```

**Windows**:
- Usa Paint: Abrir → Redimensionar → Guardar
- O IrfanView: https://www.irfanview.com

### Batch Upload Futuro

Si necesitas subir muchas imágenes de golpe, considera:
1. FTP directo al servidor
2. Script de migración
3. Extensión del admin para multi-upload

## 🎓 Ejemplos

### Ejemplo 1: Crear Plato con Foto del Celular

1. Toma foto de tu "Bandeja Paisa"
2. Abre admin en celular
3. "Nuevo Plato Destacado"
4. Nombre: "Bandeja Paisa"
5. Descripción: "..."
6. Precio: "$32.000"
7. Toca "Subir desde dispositivo"
8. Selecciona la foto que acabas de tomar
9. Espera a que suba
10. "Crear"

### Ejemplo 2: Actualizar Foto de Plato Existente

1. Admin → Platos Destacados
2. Clic en ícono de editar (lápiz)
3. Sube nueva imagen
4. La anterior se reemplaza automáticamente
5. "Actualizar"

---

**¡Disfruta subiendo fotos de tus deliciosos platos!** 📸✨
