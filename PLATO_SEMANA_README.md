# Sistema "Plat de la Semaine" - Plato de la Semana

Sistema elegante y lujoso al estilo de un restaurante francés de alta cocina para mostrar el plato más vendido de cada semana, con historial acumulativo y badges para platos que ganan múltiples veces.

## Características Principales

### Diseño Elegante Estilo Francés
- **Tipografía serif** para un look sofisticado
- **Gradientes oscuros** (slate-900, purple-900) con acentos dorados
- **Elementos decorativos** con blur y efectos de brillo
- **Animaciones sutiles** (pulse, float, hover effects)
- **Texto en francés** para títulos principales ("Le Plat de la Semaine", "La Galerie des Champions")

### Sistema de Badges Inteligente
El sistema detecta automáticamente cuántas veces un plato ha ganado y le asigna badges especiales:

- **2x Ganador** - Estrella dorada (yellow)
- **3x Campeón** - Trophy naranja (orange)
- **5x Leyenda** - Corona púrpura (purple)

Los badges aparecen con animación pulse y sombras brillantes.

### Secciones del Componente

1. **Plato Destacado Actual**
   - Card principal con imagen grande
   - Información del plato con precio destacado
   - Estadísticas de ventas (unidades vendidas, pedidos)
   - Badge de victorias si aplica
   - Período de la semana

2. **Galería de Campeones (Hall of Fame)**
   - Últimos 3 platos ganadores en formato de grid
   - Mini-badges con contador de victorias
   - Hover effects elegantes
   - Fecha de victoria

## Archivos Creados

### 1. Schema SQL
**Archivo**: `supabase-weekly-dishes-schema.sql`

Crea la infraestructura de base de datos:

**Tabla `weekly_featured_dishes`**:
- `id` - UUID único
- `item_id` - ID del plato
- `item_name` - Nombre del plato
- `item_description` - Descripción
- `item_price` - Precio
- `item_image` - URL de imagen (opcional)
- `week_start_date` / `week_end_date` - Período de la semana
- `total_orders` / `total_quantity_sold` / `total_revenue` - Estadísticas
- `win_count` - Contador de victorias (incrementa automáticamente)
- `is_active` - Estado de publicación
- `published_at` / `published_by` - Metadatos

**Funciones SQL**:
- `get_current_week_winner()` - Obtiene el plato más vendido de la semana actual
- `publish_weekly_winner(...)` - Publica un plato, incrementa contador si ya ganó antes
- `get_featured_dishes_history(limit, only_active)` - Obtiene historial
- `get_current_featured_dish()` - Obtiene el plato activo actual

**Índices**:
- Por fecha de inicio de semana
- Por item_id
- Por estado activo
- Por fecha de publicación

### 2. API Routes
**Archivo**: `app/api/weekly-dishes/route.ts`

**GET** - Consultar platos destacados:
```typescript
// Plato activo actual
GET /api/weekly-dishes?type=current

// Historial (últimos 20)
GET /api/weekly-dishes?type=history&limit=20&onlyActive=false

// Ganador de semana actual (sin publicar)
GET /api/weekly-dishes?type=winner
```

**POST** - Publicar plato ganador:
```typescript
POST /api/weekly-dishes
Body: {
  item_id: string,
  item_name: string,
  item_description: string,
  item_price: number,
  item_image?: string,
  total_orders: number,
  total_quantity_sold: number,
  total_revenue: number,
  week_start_date: string, // YYYY-MM-DD
  week_end_date: string,   // YYYY-MM-DD
  published_by?: string
}
```

**PATCH** - Actualizar plato:
```typescript
PATCH /api/weekly-dishes
Body: {
  id: string,
  is_active?: boolean,
  item_image?: string
}
```

### 3. Componente React
**Archivo**: `components/PlatDeLaSemaine.tsx`

Componente principal con:
- Diseño responsivo (mobile-first)
- Carga automática de datos
- Estado de loading elegante
- Plato destacado con imagen
- Grid de historial (últimos 3)
- Sistema de badges dinámico
- Formateo de moneda colombiana
- Formateo de fechas en español

### 4. Integración en Página Principal
**Archivo**: `app/page.tsx` (modificado)

El componente se integra justo después de la sección de comidas destacadas:
```tsx
<PlatDeLaSemaine />
```

### 5. Panel de Administrador
**Archivo**: `app/admin/estadisticas/page.tsx` (modificado)

Agregado:
- Botón "Publicar Ganador de la Semana" (solo visible en filtro "Esta Semana")
- Función `publishWeeklyWinner()` que:
  - Toma el plato #1 del top 10 semanal
  - Calcula fechas de inicio/fin de semana
  - Publica vía API
  - Muestra mensaje de éxito
- Estados de loading y error para la publicación

## Instalación

### Paso 1: Ejecutar Schema SQL en Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Ve a **SQL Editor** → **New Query**
3. Copia y pega el contenido de `supabase-weekly-dishes-schema.sql`
4. Ejecuta el script (Run o Ctrl+Enter)
5. Verifica que se crearon:
   - Tabla `weekly_featured_dishes`
   - 4 funciones SQL
   - 4 índices

### Paso 2: Verificar Dependencias

Las dependencias ya están instaladas:
- `@supabase/supabase-js`
- `lucide-react`
- `next`, `react`

### Paso 3: Variables de Entorno

Verifica que `.env.local` contenga:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Paso 4: Ejecutar la Aplicación

```bash
npm run dev
```

### Paso 5: Probar el Sistema

1. **Ver estadísticas**:
   - Ve a `/admin/estadisticas`
   - Cambia el filtro a "Esta Semana"
   - Revisa el top 10 de platos

2. **Publicar plato de la semana**:
   - Haz clic en "Publicar Ganador de la Semana"
   - Confirma la acción
   - Espera el mensaje de éxito

3. **Ver en la página principal**:
   - Ve a la home page (`/`)
   - Scroll hasta después de la sección de comidas
   - Verás "Le Plat de la Semaine" con diseño elegante francés

## Uso del Sistema

### Flujo Normal de Trabajo

**Semanal** (cada lunes):
1. Ve a `/admin/estadisticas`
2. Filtra por "Esta Semana"
3. Revisa el plato más vendido
4. Haz clic en "Publicar Ganador de la Semana"
5. El plato aparecerá automáticamente en la home page

**Platos Repetidos**:
- Si un plato gana 2 veces → Badge "2x Ganador" ⭐
- Si gana 3 veces → Badge "3x Campeón" 🏆
- Si gana 5+ veces → Badge "5x Leyenda" 👑

### Cómo Funciona el Contador

La función `publish_weekly_winner()` automáticamente:
1. Cuenta cuántas veces ese `item_id` ya ganó antes
2. Incrementa el contador `win_count`
3. Guarda el nuevo registro

Ejemplo:
```sql
-- Primera vez que gana "Bandeja Paisa"
win_count = 1 (sin badge)

-- Segunda vez
win_count = 2 (badge "2x Ganador")

-- Quinta vez
win_count = 5 (badge "5x Leyenda")
```

## Personalización

### Cambiar Colores

En `components/PlatDeLaSemaine.tsx`, busca:

```tsx
// Fondo principal
className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"

// Acentos dorados
className="text-yellow-400"

// Card principal
className="from-slate-800/90 to-slate-900/90"
```

### Modificar Badges

En la función `getWinBadge()`:

```typescript
const badges = [
  { threshold: 2, icon: Star, label: "2x Ganador", color: "from-yellow-400 to-yellow-600" },
  { threshold: 3, icon: Award, label: "3x Campeón", color: "from-orange-400 to-orange-600" },
  { threshold: 5, icon: Crown, label: "5x Leyenda", color: "from-purple-400 to-purple-600" },
];
```

Puedes agregar más niveles:
```typescript
{ threshold: 10, icon: Trophy, label: "10x Maestro", color: "from-red-400 to-red-600" }
```

### Cambiar Cantidad de Historia

En `PlatDeLaSemaine.tsx`:

```typescript
// Cambiar de 10 a 20 elementos en historial
fetch('/api/weekly-dishes?type=history&limit=20')

// Cambiar cantidad mostrada en grid (de 3 a 6)
{history.slice(0, 6).map((dish, index) => (
```

### Agregar Imágenes

Para agregar imágenes de los platos:

1. **Subir imágenes** a Supabase Storage o Vercel Blob
2. **Obtener URL** de la imagen
3. **Al publicar**, incluir en el body:
```typescript
item_image: "https://tu-storage.com/imagen.jpg"
```

4. **Modificar función SQL** si necesitas obtener imagen desde `menu_items`:
```sql
-- En publish_weekly_winner, hacer JOIN con menu_items
-- para obtener automáticamente la imagen del plato
```

### Texto en Español

Si prefieres todo en español, cambia en `PlatDeLaSemaine.tsx`:

```tsx
// De:
<h2>Le Plat de la Semaine</h2>
<p>Notre chef a sélectionné...</p>
<span>Cette Semaine</span>
<h3>La Galerie des Champions</h3>

// A:
<h2>El Plato de la Semana</h2>
<p>Nuestro chef ha seleccionado...</p>
<span>Esta Semana</span>
<h3>La Galería de Campeones</h3>
```

## Estructura de Datos

### Ejemplo de Plato Publicado

```json
{
  "id": "uuid-123",
  "item_id": "item_456",
  "item_name": "Bandeja Paisa Especial",
  "item_description": "Deliciosa bandeja paisa con todos los acompañamientos tradicionales",
  "item_price": 32000,
  "item_image": "https://example.com/bandeja.jpg",
  "week_start_date": "2025-02-03",
  "week_end_date": "2025-02-09",
  "total_orders": 45,
  "total_quantity_sold": 67,
  "total_revenue": 2144000,
  "win_count": 3,
  "is_active": true,
  "published_at": "2025-02-10T10:30:00Z",
  "published_by": "admin@restaurante.com"
}
```

### Respuesta API - Current Featured

```json
{
  "success": true,
  "type": "current",
  "data": [{
    "id": "uuid-123",
    "item_name": "Bandeja Paisa Especial",
    "win_count": 3,
    ...
  }]
}
```

### Respuesta API - History

```json
{
  "success": true,
  "type": "history",
  "data": [
    { "id": "uuid-123", "week_start_date": "2025-02-03", ... },
    { "id": "uuid-456", "week_start_date": "2025-01-27", ... },
    { "id": "uuid-789", "week_start_date": "2025-01-20", ... }
  ]
}
```

## Solución de Problemas

### No aparece ningún plato

**Causa**: No hay plato publicado aún.

**Solución**:
1. Ve a `/admin/estadisticas`
2. Filtra por "Esta Semana"
3. Publica el ganador

### Error al publicar

**Posibles causas**:
- No estás en el filtro "Esta Semana"
- No hay datos de ventas esta semana
- Error de permisos en Supabase

**Solución**:
1. Verifica que hay pedidos esta semana
2. Revisa la consola del navegador
3. Verifica permisos de la función SQL

### Badge no aparece

**Causa**: `win_count` es 1.

**Explicación**: Los badges solo aparecen a partir de 2 victorias.

**Para probar**: Publica el mismo plato manualmente varias veces (cambiando semanas).

### Imagen no se muestra

**Causa**: `item_image` es null.

**Solución**:
- Por defecto muestra un ícono Award
- Agrega imágenes vía PATCH:
```typescript
PATCH /api/weekly-dishes
Body: { id: "uuid", item_image: "url" }
```

## Roadmap Futuro

Posibles mejoras:
- [ ] Integración automática de imágenes desde `menu_items`
- [ ] Notificaciones automáticas al publicar (email, WhatsApp)
- [ ] Página dedicada para ver historial completo con filtros
- [ ] Compartir en redes sociales
- [ ] Certificados digitales para platos "Leyenda"
- [ ] Gráficos de tendencias semanales
- [ ] Modo de publicación automática (cada lunes)
- [ ] Sistema de votación de clientes

## Créditos de Diseño

Inspirado en:
- **Restaurantes franceses de alta cocina** (Michelin Star)
- **Tipografía serif** elegante
- **Paleta oscura premium** (slate + purple + gold)
- **Efectos de lujo** (blur, glow, gradients)

## Soporte

Para problemas:
1. Revisa la consola del navegador (F12)
2. Verifica logs de Supabase
3. Prueba las funciones SQL directamente en Supabase SQL Editor
4. Revisa que el schema SQL se ejecutó correctamente

---

**Desarrollado con**: Next.js 14, TypeScript, Supabase, Tailwind CSS, Lucide Icons

**Diseño**: French Luxury Restaurant Style 🇫🇷✨
