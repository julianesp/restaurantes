# 🚀 Setup Rápido - Estadísticas Predictivas

## Pasos de Instalación

### 1️⃣ Ejecutar Script SQL en Supabase (IMPORTANTE)

1. Abre tu proyecto de Supabase: https://app.supabase.com
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo: `supabase-predictive-statistics.sql`
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **RUN** o presiona Ctrl+Enter
7. Verifica que dice "Success" sin errores

### 2️⃣ Verificar Instalación

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
-- Debería retornar sin errores (puede estar vacío si no hay datos)
SELECT * FROM get_predictive_dish_analysis(30, 0.3) LIMIT 5;
```

### 3️⃣ Acceder a la Funcionalidad

1. Inicia sesión como **administrador**
2. Ve a: **Admin → Estadísticas**
3. Las estadísticas predictivas aparecerán automáticamente en la parte superior
4. Usa el botón **"Mostrar/Ocultar Predictivo"** para alternar la visualización

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado sin errores en Supabase
- [ ] Consulta de verificación funciona correctamente
- [ ] Puedes acceder a la página de estadísticas como admin
- [ ] Ves el botón "Mostrar/Ocultar Predictivo"
- [ ] Las estadísticas predictivas se cargan (o muestran "no hay datos" si es nuevo)

## 🎯 Qué Esperar Ver

Una vez configurado correctamente, verás 3 secciones principales:

1. **Platos para Preparar con Anticipación**
   - Lista priorizada de platos frecuentes
   - Cantidad recomendada para preparar
   - Horarios pico de pedido

2. **Patrones de Pedidos por Hora**
   - Gráficos de actividad por hora
   - Platos más pedidos en cada franja horaria

3. **Platos Favoritos de Clientes Frecuentes**
   - Platos que los clientes piden repetidamente
   - Scores de lealtad

## 🐛 Problemas Comunes

### "Failed to fetch predictive statistics"
**Solución**: No ejecutaste el script SQL. Ve al Paso 1.

### "No hay datos disponibles"
**Solución**: Es normal en un sistema nuevo. Necesitas tener pedidos históricos con status != 'cancelled'.

### Error 500 en la API
**Solución**: Verifica que las variables de entorno están correctas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📚 Documentación Completa

Lee el archivo **ESTADISTICAS_PREDICTIVAS_README.md** para:
- Guía completa de uso
- Interpretación de datos
- Casos de uso
- Configuración avanzada
- API endpoints

## 🎉 ¡Listo!

Una vez completados estos pasos, las estadísticas predictivas estarán funcionando y solo serán visibles para los administradores autorizados.

---

**Tiempo estimado de setup**: 5-10 minutos
