# Estadísticas Predictivas para Preparación Anticipada de Platos

## 📊 Descripción

Este módulo de estadísticas predictivas analiza patrones de pedidos históricos para ayudar a los administradores del restaurante a preparar los platos más demandados con anticipación, mejorando la eficiencia del servicio y reduciendo los tiempos de espera.

## ✨ Características Principales

### 1. **Análisis Predictivo de Platos**
- Identifica platos que se piden con alta frecuencia y consistencia
- Calcula cantidad recomendada para preparar
- Determina horarios pico de pedido
- Asigna prioridades de preparación

### 2. **Patrones por Hora del Día**
- Muestra las horas más activas del restaurante
- Identifica los platos más pedidos en cada franja horaria
- Calcula ticket promedio por hora

### 3. **Favoritos de Clientes Frecuentes**
- Detecta platos que los clientes piden repetidamente
- Calcula scores de lealtad
- Identifica patrones de clientes recurrentes

## 🚀 Instalación

### Paso 1: Ejecutar el Script SQL en Supabase

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Abre el archivo `supabase-predictive-statistics.sql`
4. Copia y pega todo el contenido en el editor SQL
5. Haz clic en **Run** para ejecutar el script

El script creará las siguientes funciones:
- `get_predictive_dish_analysis()` - Análisis predictivo principal
- `get_hourly_order_patterns()` - Patrones horarios
- `get_customer_favorite_patterns()` - Favoritos de clientes

### Paso 2: Verificar la Instalación

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
SELECT * FROM get_predictive_dish_analysis(30, 0.3) LIMIT 5;
```

Si devuelve resultados (o un array vacío si no hay suficientes datos), la instalación fue exitosa.

## 📖 Cómo Usar

### Acceso a las Estadísticas Predictivas

1. Inicia sesión como **administrador**
2. Ve a **Admin → Estadísticas**
3. Las estadísticas predictivas se muestran automáticamente en la parte superior
4. Puedes alternar la visibilidad con el botón **"Mostrar/Ocultar Predictivo"**

### Interpretación de los Datos

#### **Prioridad de Preparación**
- 🔥 **Prioridad 1** (Muy Alta): Preparar SIEMPRE - alta frecuencia (≥80%)
- 🎯 **Prioridad 2** (Alta): Preparar REGULARMENTE - frecuencia 60-79%
- ⚠️ **Prioridad 3** (Media): Preparar OCASIONALMENTE - frecuencia 40-59%

#### **Consistencia**
- **Muy Alta**: Se pide casi todos los días (≥80% de días)
- **Alta**: Se pide 6+ días por semana (≥60% de días)
- **Media**: Se pide 4-5 días por semana (≥40% de días)
- **Baja**: Se pide 2-3 días por semana (≥20% de días)

#### **Cantidad Recomendada**
Es el promedio diario + 20% de margen de seguridad, redondeado hacia arriba.

**Ejemplo:**
```
Plato: Bandeja Paisa
Promedio diario: 8.5 unidades
Cantidad recomendada: 11 unidades (8.5 × 1.2 = 10.2 → 11)
```

#### **Hora Pico**
Indica el rango de 2 horas donde el plato se pide más frecuentemente.

**Ejemplo:**
```
Hora Pico: 12:00 - 14:00
Acción: Preparar el plato antes de las 12:00
```

### Ejemplo de Flujo de Trabajo

**Escenario: Preparación del día**

1. **8:00 AM** - El chef revisa las estadísticas predictivas
2. Observa que la **Bandeja Paisa** tiene:
   - Prioridad 1 🔥
   - Consistencia: Muy Alta
   - Cantidad recomendada: 15 unidades
   - Hora pico: 12:00 - 14:00

3. **Acción**: Prepara 15 porciones de Bandeja Paisa antes de las 12:00

4. **Resultado**:
   - ✅ Reducción del tiempo de espera
   - ✅ Servicio más rápido durante hora pico
   - ✅ Clientes satisfechos

## 🔧 Configuración Avanzada

### Ajustar Parámetros de Análisis

Puedes personalizar los parámetros en el componente:

```tsx
<PredictiveStatistics
  daysToAnalyze={30}      // Días de histórico a analizar
  minFrequency={0.3}      // Frecuencia mínima (30% de días)
/>
```

**Parámetros recomendados según tipo de restaurante:**

| Tipo de Restaurante | daysToAnalyze | minFrequency |
|---------------------|---------------|--------------|
| Fast Food           | 14            | 0.6          |
| Restaurante Casual  | 30            | 0.3          |
| Fine Dining         | 60            | 0.2          |

### Consultas SQL Personalizadas

#### Ver platos de máxima prioridad
```sql
SELECT item_name, recommended_prep_quantity, peak_hour_start, peak_hour_end
FROM get_predictive_dish_analysis(30, 0.6)
WHERE preparation_priority = 1
ORDER BY frequency_score DESC;
```

#### Ver patrones de almuerzo (11:00 - 15:00)
```sql
SELECT *
FROM get_hourly_order_patterns('week')
WHERE hour_of_day BETWEEN 11 AND 15
ORDER BY total_orders DESC;
```

#### Ver platos más leales
```sql
SELECT item_name, loyalty_score, repeat_order_rate
FROM get_customer_favorite_patterns(30)
WHERE repeat_order_rate > 50
ORDER BY loyalty_score DESC
LIMIT 10;
```

## 📊 API Endpoints

### GET `/api/statistics/predictive`

#### Parámetros:

| Parámetro | Tipo | Valores | Default | Descripción |
|-----------|------|---------|---------|-------------|
| type | string | dishes, hourly, customer-favorites | dishes | Tipo de análisis |
| daysToAnalyze | number | 1-365 | 30 | Días de histórico |
| minFrequency | number | 0-1 | 0.3 | Frecuencia mínima |
| timeFilter | string | today, week, month, all | week | Filtro temporal (solo para hourly) |

#### Ejemplos:

```typescript
// Platos predictivos de últimos 30 días
fetch('/api/statistics/predictive?type=dishes&daysToAnalyze=30&minFrequency=0.3')

// Patrones horarios de esta semana
fetch('/api/statistics/predictive?type=hourly&timeFilter=week')

// Favoritos de clientes
fetch('/api/statistics/predictive?type=customer-favorites&daysToAnalyze=60')
```

## 🎯 Casos de Uso

### 1. **Preparación Matutina**
- Revisar platos de Prioridad 1 y 2
- Preparar cantidades recomendadas antes del servicio
- Enfocarse en platos con hora pico temprana

### 2. **Gestión de Inventario**
- Usar datos de frecuencia para compras
- Identificar ingredientes de alta rotación
- Optimizar almacenamiento

### 3. **Planificación de Personal**
- Usar patrones horarios para asignar staff
- Reforzar cocina en horas pico
- Optimizar turnos

### 4. **Menú del Día**
- Seleccionar platos de alta lealtad
- Ofrecer favoritos de clientes frecuentes
- Crear combos basados en patrones

## ⚡ Mejores Prácticas

1. **Revisar estadísticas diariamente** antes del servicio
2. **Actualizar datos** regularmente con el botón "Actualizar"
3. **Combinar con inventario** - no preparar más de lo que tienes ingredientes
4. **Considerar temporalidad** - fines de semana vs días laborables
5. **Documentar resultados** - anotar si las predicciones fueron acertadas
6. **Ajustar parámetros** según tu experiencia y tipo de negocio

## 🔐 Seguridad

- ✅ Solo visible para administradores autenticados
- ✅ Validación de email en ADMIN_EMAILS (`.env.local`)
- ✅ Protegido por Clerk authentication
- ✅ API usa Supabase Service Role Key

## 🐛 Solución de Problemas

### Error: "Failed to fetch predictive statistics"

**Causa**: Las funciones SQL no están creadas en Supabase

**Solución**:
1. Ve al SQL Editor de Supabase
2. Ejecuta el archivo `supabase-predictive-statistics.sql`
3. Actualiza la página

### No aparecen datos

**Causa**: No hay suficientes pedidos en el período analizado

**Solución**:
- Reduce `minFrequency` a 0.1 o 0.2
- Aumenta `daysToAnalyze` a 60 o 90
- Verifica que existen pedidos con status != 'cancelled'

### Datos no actualizados

**Causa**: Cache del navegador

**Solución**:
- Haz clic en el botón "Actualizar"
- Recarga la página (Ctrl/Cmd + R)
- Limpia caché del navegador

## 📈 Métricas de Éxito

Mide el impacto de usar estadísticas predictivas:

- ⏱️ **Tiempo de espera promedio** - debe reducirse
- 😊 **Satisfacción del cliente** - debe aumentar
- 📦 **Desperdicio de comida** - debe reducirse
- 💰 **Ventas durante hora pico** - deben aumentar

## 🚀 Próximas Mejoras

Funcionalidades planeadas:

- [ ] Notificaciones automáticas matutinas
- [ ] Integración con sistema de inventario
- [ ] Predicción por día de la semana
- [ ] Análisis de estacionalidad
- [ ] Exportar reportes en PDF
- [ ] Dashboard móvil para el chef

## 💡 Consejos Pro

1. **Combina con intuición**: Las estadísticas son una guía, no una regla absoluta
2. **Eventos especiales**: Ajusta manualmente para fechas especiales
3. **Clima**: Considera factores externos (lluvia, calor, etc.)
4. **Tendencias**: Algunos platos son de "moda" temporal
5. **Feedback del equipo**: Comparte datos con cocina y meseros

## 📝 Notas Técnicas

### Algoritmo de Frecuencia

```
frequency_score = días_ordenados / total_días_analizados

Ejemplo:
- Plato ordenado 24 de 30 días
- Frecuencia = 24/30 = 0.80 = 80%
```

### Cálculo de Cantidad Recomendada

```
cantidad_recomendada = CEIL(promedio_diario × 1.2)

Ejemplo:
- Promedio: 8.5 unidades/día
- Recomendado: CEIL(8.5 × 1.2) = CEIL(10.2) = 11 unidades
```

### Score de Lealtad

```
loyalty_score = (clientes_repetidos / total_clientes) × (pedidos_totales / total_clientes)

Ejemplo:
- 10 clientes únicos
- 8 clientes repetidos
- 30 pedidos totales
- Score = (8/10) × (30/10) = 0.8 × 3 = 2.4
```

## 🤝 Soporte

Si tienes problemas o sugerencias:
1. Revisa la sección "Solución de Problemas"
2. Verifica los logs del navegador (F12 → Console)
3. Revisa logs de Supabase
4. Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ para optimizar la operación de tu restaurante**
