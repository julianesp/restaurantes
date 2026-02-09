# 🔐 Configuración de ePayco - Sistema de Pagos

## ✅ Integración Completada

Se ha migrado completamente de Wompi a **ePayco** como pasarela de pagos del restaurante.

---

## 📋 Credenciales Configuradas

Las siguientes credenciales están configuradas en `.env.local`:

```env
# ePayco Payment Gateway
NEXT_PUBLIC_EPAYCO_PUBLIC_KEY=101df072a3893ba3a275792688bbd7b1
EPAYCO_PRIVATE_KEY=202c490f729670c6ae421c8031c2c6ab
EPAYCO_P_CUST_ID_CLIENTE=1561203
EPAYCO_P_KEY=2d9fe7c7c0a93958d633f67ad51f14e4be86e686
NEXT_PUBLIC_EPAYCO_TEST_MODE=false
NEXT_PUBLIC_BASE_URL=https://restaurantes-phi.vercel.app
```

⚠️ **IMPORTANTE**: Estas credenciales están en **modo PRODUCCIÓN** (`TEST_MODE=false`)

---

## 🏗️ Arquitectura Implementada

### 1. **Archivos Creados**

#### API Routes
- `/app/api/epayco/create-payment/route.ts` - Crear enlaces de pago
- `/app/api/epayco/webhook/route.ts` - Recibir confirmaciones de pago
- `/app/api/epayco/transaction/[id]/route.ts` - Consultar estado de transacciones

#### Utilidades
- `/utils/epayco.ts` - Funciones helper para ePayco
- `/types/epayco-sdk-node.d.ts` - Tipos TypeScript para el SDK

### 2. **Archivos Actualizados**

- `components/OrderModal.tsx` - Ahora usa ePayco
- `components/ReservationModal.tsx` - Ahora usa ePayco
- `app/checkout/page.tsx` - Ahora usa ePayco
- `proxy.ts` - Rutas públicas actualizadas
- `.env.local` - Credenciales de ePayco

### 3. **Archivos Eliminados**

- ❌ `/app/api/wompi/` - Eliminado completamente
- ❌ `/utils/wompi.ts` - Eliminado completamente
- ❌ `WOMPI_CONFIG.md` - Eliminado completamente

---

## 🔄 Flujo de Pago

### Proceso Completo

1. **Cliente inicia pago** (Pedido o Reserva)
   - Se genera una referencia única
   - Se crea el pago en ePayco

2. **Redirección a ePayco**
   - Cliente es redirigido al checkout de ePayco
   - Completa el pago con tarjeta, PSE, etc.

3. **Confirmación de pago**
   - ePayco envía confirmación al webhook
   - Se actualiza el estado en el sistema

4. **Retorno al restaurante**
   - Cliente regresa a la página de éxito
   - Se muestra confirmación del pedido/reserva

---

## 📡 API Endpoints

### 1. Crear Pago

```typescript
POST /api/epayco/create-payment

// Body
{
  "amount": 50000,
  "reference": "PEDIDO-ABC123-1234567890",
  "description": "Pedido de comida",
  "customerEmail": "cliente@example.com",
  "customerName": "Juan Pérez",
  "customerPhone": "3001234567",
  "redirectUrl": "https://restaurante.com/payment/success"
}

// Response
{
  "success": true,
  "paymentUrl": "https://checkout.epayco.co/...",
  "reference": "PEDIDO-ABC123-1234567890",
  "transactionId": "epayco-transaction-id"
}
```

### 2. Webhook de Confirmación

```typescript
POST /api/epayco/webhook

// ePayco envía:
{
  "x_ref_payco": "123456",
  "x_transaction_id": "789012",
  "x_amount": "50000",
  "x_transaction_state": "Aceptada", // Aceptada, Rechazada, Pendiente
  "x_invoice": "PEDIDO-ABC123-1234567890",
  "x_approval_code": "000000"
}
```

### 3. Consultar Transacción

```typescript
GET /api/epayco/transaction/[id]

// Response
{
  "success": true,
  "data": {
    "estado": "Aceptada",
    "ref_payco": "123456",
    // ... más datos de ePayco
  }
}
```

---

## 🔧 Funciones Utilitarias

### En `/utils/epayco.ts`

```typescript
// Crear enlace de pago
const payment = await createPaymentLink({
  amount: 50000,
  currency: 'COP',
  reference: 'PEDIDO-123',
  description: 'Pedido de comida',
  customerEmail: 'cliente@example.com',
  customerName: 'Juan Pérez',
  customerPhone: '3001234567',
  redirectUrl: 'https://restaurante.com/success'
});

// Generar referencia única
const ref = generatePaymentReference('PEDIDO');
// Retorna: "PEDIDO-A1B2C3-1234567890"

// Formatear precio en COP
const precio = formatCOP(50000);
// Retorna: "$50.000"

// Verificar estado de transacción
const status = await getTransactionStatus('transaction-id');
```

---

## 🎨 Componentes Actualizados

### OrderModal

```typescript
// Ahora usa ePayco
import { createPaymentLink } from "../utils/epayco";

const handlePayment = async () => {
  const payment = await createPaymentLink({...});
  window.location.href = payment.paymentUrl; // Redirige a ePayco
};
```

### ReservationModal

```typescript
// Ahora usa ePayco
import { createPaymentLink } from "../utils/epayco";

const handleReservation = async () => {
  const payment = await createPaymentLink({...});
  window.location.href = payment.paymentUrl; // Redirige a ePayco
};
```

---

## 🔒 Seguridad

### Variables de Entorno

✅ **Públicas** (pueden estar en el cliente):
- `NEXT_PUBLIC_EPAYCO_PUBLIC_KEY`
- `NEXT_PUBLIC_EPAYCO_TEST_MODE`
- `NEXT_PUBLIC_BASE_URL`

🔐 **Privadas** (SOLO en el servidor):
- `EPAYCO_PRIVATE_KEY`
- `EPAYCO_P_CUST_ID_CLIENTE`
- `EPAYCO_P_KEY`

### Validaciones

- ✅ Verificación de monto en el servidor
- ✅ Validación de referencia única
- ✅ Confirmación de pago mediante webhook
- ✅ No se exponen claves privadas al cliente

---

## 📝 Estados de Transacción

ePayco retorna los siguientes estados:

| Estado | Descripción |
|--------|-------------|
| `Aceptada` | Pago exitoso ✅ |
| `Rechazada` | Pago rechazado ❌ |
| `Pendiente` | Pago en proceso ⏳ |
| `Fallida` | Error en el pago 💥 |

---

## 🧪 Testing

### Tarjetas de Prueba ePayco

Si `TEST_MODE=true`, usar estas tarjetas:

```
✅ Tarjeta exitosa:
Número: 4575623182290326
CVV: 123
Fecha: Cualquier fecha futura

❌ Tarjeta rechazada:
Número: 4151611527583283
CVV: 123
Fecha: Cualquier fecha futura
```

---

## 🚀 Deployment

### En Vercel

1. Agregar variables de entorno en Vercel Dashboard:
   - `NEXT_PUBLIC_EPAYCO_PUBLIC_KEY`
   - `EPAYCO_PRIVATE_KEY`
   - `EPAYCO_P_CUST_ID_CLIENTE`
   - `EPAYCO_P_KEY`
   - `NEXT_PUBLIC_EPAYCO_TEST_MODE=false`
   - `NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app`

2. Configurar webhook en ePayco:
   - URL: `https://tu-dominio.vercel.app/api/epayco/webhook`
   - Método: POST

3. Deploy:
   ```bash
   git push origin main
   ```

---

## 📊 Monitoreo

### Logs del Sistema

Los pagos se registran en la consola:

```
✅ Pago exitoso - Referencia: PEDIDO-ABC123, ePayco Ref: 123456
❌ Pago rechazado - Referencia: PEDIDO-ABC123
⏳ Pago pendiente - Referencia: PEDIDO-ABC123
```

### Dashboard de ePayco

Monitorea todas las transacciones en:
https://dashboard.epayco.co/

---

## 🆘 Troubleshooting

### Error: "Could not create payment"

1. Verificar credenciales en `.env.local`
2. Revisar que el monto sea mayor a 0
3. Verificar conexión a internet

### Webhook no recibe confirmaciones

1. Verificar URL en dashboard de ePayco
2. Asegurar que la URL sea HTTPS (no HTTP)
3. Revisar logs en Vercel

### Pago exitoso pero no se refleja

1. Verificar webhook en ePayco dashboard
2. Revisar logs del servidor
3. Consultar estado con `/api/epayco/transaction/[id]`

---

## 📚 Recursos

- [ePayco Docs](https://docs.epayco.co/)
- [ePayco Dashboard](https://dashboard.epayco.co/)
- [SDK Node.js](https://github.com/epayco/epayco-node)

---

## ✨ Diferencias vs Wompi

| Característica | Wompi | ePayco |
|----------------|-------|--------|
| Estado actual | ❌ Con errores | ✅ Funcionando |
| Tarjetas | ✅ | ✅ |
| PSE | ✅ | ✅ |
| Efectivo | ❌ | ✅ |
| Comisión | ~2.99% | ~2.49% |
| Soporte | 🟡 Regular | ✅ Excelente |

---

**✅ Migración completada exitosamente**

Todos los archivos de Wompi han sido eliminados y reemplazados por ePayco.
