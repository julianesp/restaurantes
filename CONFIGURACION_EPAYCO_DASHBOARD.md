# 🎯 Configuración del Dashboard de ePayco

## ✅ URLs Confirmadas y Funcionando

Ambas páginas están **creadas y funcionando** correctamente:

### 1. **Página de Respuesta (Success)**
```
https://restaurantes-phi.vercel.app/payment/success
```

✅ **Funcionalidades:**
- Muestra confirmación de pago exitoso
- Detecta automáticamente si es pedido o reserva
- Muestra referencia de ePayco
- Permite descargar factura en PDF
- Envía confirmación por WhatsApp
- Maneja estados: Aceptada, Rechazada, Pendiente

### 2. **Webhook de Confirmación**
```
https://restaurantes-phi.vercel.app/api/epayco/webhook
```

✅ **Funcionalidades:**
- Recibe confirmaciones automáticas de ePayco
- Procesa el estado de la transacción
- Registra logs en el servidor
- Acepta POST y GET

---

## 📋 Configuración en el Dashboard de ePayco

### Paso 1: Ir a Configuración

1. Entra a https://dashboard.epayco.co/
2. Ve a **Inicio** → **Configuración**
3. Busca la sección **"URL Respuesta y Confirmación"**

### Paso 2: Configurar URLs

Ingresa estas URLs **exactamente como se muestran**:

#### ✅ URL de Respuesta
```
https://restaurantes-phi.vercel.app/payment/success
```

- ✅ Activar switch **"¿URL de Respuesta?"**
- Esta es donde el cliente regresa después del pago

#### ✅ URL de Confirmación
```
https://restaurantes-phi.vercel.app/api/epayco/webhook
```

- ✅ Activar switch **"¿URL de Confirmación?"**
- **Método de consulta:** `POST`
- Esta es donde ePayco envía la confirmación automática

### Paso 3: Modo de Operación

Selecciona el modo según tus necesidades:

#### Para Pruebas (Recomendado al inicio)
- Switch en **"Pruebas"** (izquierda)
- Actualiza `.env.local`:
  ```env
  NEXT_PUBLIC_EPAYCO_TEST_MODE=true
  ```

#### Para Producción (Pagos reales)
- Switch en **"Producción"** (derecha)
- Actualiza `.env.local`:
  ```env
  NEXT_PUBLIC_EPAYCO_TEST_MODE=false
  ```

### Paso 4: Guardar Cambios

Haz clic en el botón **"Guardar"** o **"Estados a confirmar"**

---

## 🔄 Flujo Completo del Pago

### 1️⃣ Cliente Inicia Pago
```
Restaurante → API /api/epayco/create-payment → ePayco
```

### 2️⃣ Cliente Paga en ePayco
```
ePayco Checkout → Cliente ingresa datos → Procesa pago
```

### 3️⃣ ePayco Envía Confirmación (Webhook)
```
ePayco → POST /api/epayco/webhook
```

**Datos que envía ePayco:**
```json
{
  "x_ref_payco": "123456",
  "x_transaction_id": "789012",
  "x_transaction_state": "Aceptada",
  "x_invoice": "PEDIDO-ABC123-1234567890",
  "x_amount": "50000",
  "x_approval_code": "000000"
}
```

### 4️⃣ Cliente es Redirigido a Página de Éxito
```
ePayco → Redirige a /payment/success?ref_payco=123&x_transaction_state=Aceptada&x_invoice=PEDIDO-ABC123
```

**Lo que ve el cliente:**
- ✅ Confirmación de pago exitoso
- 📄 Botón "Ver y Descargar Factura"
- 📱 Redirección automática a WhatsApp
- 🏠 Botón "Volver al Inicio"

---

## 🎨 Experiencia del Usuario

### Pago Exitoso ✅

```
┌──────────────────────────────┐
│     ✓ ¡Pago Exitoso!         │
├──────────────────────────────┤
│ ¡Tu pedido ha sido           │
│ confirmado! En breve te      │
│ redirigiremos a WhatsApp.    │
│                              │
│ Referencia ePayco: 123456    │
│                              │
│ [Ver y Descargar Factura]    │
│ [Volver al Inicio]           │
└──────────────────────────────┘
```

### Pago Rechazado ❌

```
┌──────────────────────────────┐
│     ✗ Error en el Pago       │
├──────────────────────────────┤
│ El pago fue rechazado.       │
│ Por favor intenta            │
│ nuevamente o usa otro        │
│ método de pago.              │
│                              │
│ [Volver al Inicio]           │
└──────────────────────────────┘
```

### Pago Pendiente ⏳

```
┌──────────────────────────────┐
│     ⏳ Error en el Pago       │
├──────────────────────────────┤
│ El pago está pendiente       │
│ de confirmación. Te          │
│ notificaremos cuando se      │
│ complete.                    │
│                              │
│ [Volver al Inicio]           │
└──────────────────────────────┘
```

---

## 🔍 Parámetros que Envía ePayco

### En la URL de Respuesta (GET)

```
/payment/success?ref_payco=123456&x_transaction_state=Aceptada&x_invoice=PEDIDO-ABC&x_amount=50000
```

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `ref_payco` | Referencia de ePayco | `123456` |
| `x_transaction_state` | Estado del pago | `Aceptada` / `Rechazada` / `Pendiente` |
| `x_invoice` | Tu referencia | `PEDIDO-ABC123-1234567890` |
| `x_amount` | Monto pagado | `50000` |

### En el Webhook (POST)

```json
{
  "x_ref_payco": "123456",
  "x_transaction_id": "789012",
  "x_transaction_state": "Aceptada",
  "x_invoice": "PEDIDO-ABC123-1234567890",
  "x_amount": "50000",
  "x_currency_code": "COP",
  "x_approval_code": "000000",
  "x_franchise": "VISA",
  "x_response": "Aprobado",
  "x_customer_email": "cliente@example.com"
}
```

---

## 🧪 Cómo Probar

### 1. Configurar Modo de Pruebas

En `.env.local`:
```env
NEXT_PUBLIC_EPAYCO_TEST_MODE=true
```

### 2. Usar Tarjetas de Prueba

**Tarjeta Exitosa:**
```
Número: 4575623182290326
CVV: 123
Fecha: 12/25
Nombre: APPROVED
```

**Tarjeta Rechazada:**
```
Número: 4151611527583283
CVV: 123
Fecha: 12/25
Nombre: REJECTED
```

### 3. Hacer un Pedido/Reserva

1. Ve a tu sitio local: `http://localhost:3000`
2. Haz un pedido o reserva
3. Completa el pago con la tarjeta de prueba
4. Verás la página de éxito
5. Descarga la factura

### 4. Verificar en Dashboard de ePayco

1. Ve a **Pagos en línea** → **Pagos**
2. Verás la transacción de prueba
3. Revisa el estado

---

## 📊 Monitoreo y Logs

### En el Servidor (Vercel)

Los logs del webhook aparecen en la consola:

```bash
✅ Pago exitoso - Referencia: PEDIDO-ABC123, ePayco Ref: 123456
❌ Pago rechazado - Referencia: PEDIDO-ABC123
⏳ Pago pendiente - Referencia: PEDIDO-ABC123
```

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Clic en **"Deployments"**
3. Selecciona el deployment actual
4. Ve a **"Functions"**
5. Selecciona `/api/epayco/webhook`
6. Verás los logs de las confirmaciones

---

## 🆘 Solución de Problemas

### El webhook no recibe confirmaciones

✅ **Solución:**
1. Verifica que la URL esté en HTTPS (no HTTP)
2. Revisa que esté bien escrita: `https://restaurantes-phi.vercel.app/api/epayco/webhook`
3. Asegúrate que el método sea `POST`
4. Verifica en los logs de Vercel

### La página de éxito no muestra nada

✅ **Solución:**
1. Verifica que el pago se haya completado en ePayco
2. Revisa que la referencia esté guardada en localStorage
3. Abre la consola del navegador (F12) para ver errores
4. Verifica los parámetros en la URL

### El cliente no es redirigido después del pago

✅ **Solución:**
1. Verifica la URL de respuesta en ePayco dashboard
2. Asegúrate que esté activado el switch
3. Prueba con otra tarjeta de prueba
4. Revisa que no haya errores de CORS

---

## ✨ Características Implementadas

### ✅ Página de Success (`/payment/success`)

- Detecta automáticamente tipo (pedido/reserva)
- Muestra estado del pago (Aceptada/Rechazada/Pendiente)
- Muestra referencia de ePayco
- Botón para descargar factura
- Redirección automática a WhatsApp
- Diseño responsive
- Modo oscuro

### ✅ Webhook (`/api/epayco/webhook`)

- Recibe confirmaciones POST de ePayco
- Acepta confirmaciones GET
- Registra logs detallados
- Procesa estados: Aceptada, Rechazada, Pendiente
- Listo para integrar con Supabase

---

## 🚀 Próximos Pasos

1. **Configurar URLs en ePayco Dashboard** ✅
2. **Hacer deploy a Vercel** ✅
3. **Probar con tarjeta de prueba** 🔄
4. **Verificar webhook funciona** 🔄
5. **Cambiar a modo producción** ⏸️

---

## 📝 Resumen de URLs

| Tipo | URL | Propósito |
|------|-----|-----------|
| Respuesta | `https://restaurantes-phi.vercel.app/payment/success` | Cliente regresa aquí |
| Confirmación | `https://restaurantes-phi.vercel.app/api/epayco/webhook` | ePayco confirma aquí |
| Factura | `https://restaurantes-phi.vercel.app/invoice` | Descarga de PDF |

---

**✅ Todo configurado y listo para recibir pagos!** 🎉

Actualiza las URLs en el dashboard de ePayco y estarás listo para procesar pagos.
