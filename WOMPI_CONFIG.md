# Configuración de Pagos con Wompi

Este proyecto integra pagos en línea a través de Wompi para reservas y pedidos del restaurante.

## 📋 Requisitos Previos

1. **Cuenta de Wompi**: Necesitas crear una cuenta gratuita en [Wompi](https://comercios.wompi.co/register)
2. **Verificación**: Completa la verificación de identidad y datos bancarios en Wompi
3. **Credenciales API**: Obtén tus llaves API (Public Key y Private Key) desde el dashboard de Wompi

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto con tus credenciales de Wompi:

```env
# Wompi Configuration
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_tu_llave_publica_aqui
WOMPI_PRIVATE_KEY=prv_test_tu_llave_privada_aqui
NEXT_PUBLIC_WOMPI_ENV=sandbox

# URL base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Claves de Prueba vs Producción

#### Modo Sandbox (Pruebas):

- Public Key: `pub_test_xxxxxxxxxxxxx`
- Private Key: `prv_test_xxxxxxxxxxxxx`
- `NEXT_PUBLIC_WOMPI_ENV=sandbox`

#### Modo Producción:

- Public Key: `pub_prod_xxxxxxxxxxxxx`
- Private Key: `prv_prod_xxxxxxxxxxxxx`
- `NEXT_PUBLIC_WOMPI_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://tu-dominio.com`

⚠️ **IMPORTANTE**: Nunca compartas ni subas tus claves privadas a repositorios públicos.

## 💳 Funcionamiento del Sistema de Pagos

### Reservas de Mesa

1. El cliente completa el formulario de reserva
2. Se solicita un pago de **$10,000 COP** como anticipo
3. El cliente es redirigido a Wompi para completar el pago
4. Después del pago exitoso, se envía la confirmación por WhatsApp
5. El anticipo se descuenta del total de la cuenta cuando el cliente llega

### Pedidos

1. El cliente completa el formulario de pedido e ingresa el total
2. Se procesa el pago del total del pedido a través de Wompi
3. Después del pago exitoso, se envía la confirmación por WhatsApp
4. El restaurante recibe la notificación y procesa el pedido

## 🔄 Flujo de Pago

```
Cliente → Formulario → Pago Wompi → Confirmación → WhatsApp
```

1. **Formulario**: Cliente ingresa sus datos
2. **Pago**: Redirige a Wompi checkout
3. **Confirmación**: Página de éxito `/payment/success`
4. **WhatsApp**: Mensaje automático al restaurante con los detalles

## 📝 Métodos de Pago Disponibles

A través de Wompi, tus clientes pueden pagar con:

- 💳 Tarjetas de crédito y débito
- 📱 Nequi
- 🏦 PSE (Pagos Seguros en Línea)
- 💰 Bancolombia a la Mano
- Y más...

## 🔒 Seguridad

- Las claves privadas solo se usan en el servidor (API Routes)
- Los pagos se procesan en el checkout seguro de Wompi
- Wompi está certificado con PCI DSS nivel 1
- Los datos de pago nunca pasan por tu servidor

## 🎯 Números de WhatsApp

Actualiza el número de WhatsApp del restaurante en:

1. **components/ReservationModal.tsx** (línea ~90)
2. **components/OrderModal.tsx** (línea ~92)
3. **app/payment/success/page.tsx** (líneas ~42 y ~74)

```typescript
const numeroWhatsApp = "573174503604"; // Cambia por tu número
```

## 🧪 Pruebas

### Tarjetas de Prueba (Sandbox)

Para probar pagos en modo sandbox, usa estas tarjetas de prueba:

**Visa - Pago Exitoso:**

- Número: `4242 4242 4242 4242`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Mastercard - Pago Exitoso:**

- Número: `5555 5555 5555 4444`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Visa - Pago Rechazado:**

- Número: `4111 1111 1111 1111`
- CVV: `123`
- Fecha: Cualquier fecha futura

Más tarjetas de prueba en: [Documentación Wompi](https://docs.wompi.co/docs/tarjetas-de-prueba)

## 🚀 Despliegue a Producción

### Antes de ir a producción:

1. ✅ Obtén las claves de producción de Wompi
2. ✅ Actualiza las variables de entorno en tu servicio de hosting
3. ✅ Cambia `NEXT_PUBLIC_WOMPI_ENV` a `production`
4. ✅ Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio real
5. ✅ Verifica que el número de WhatsApp sea el correcto
6. ✅ Prueba el flujo completo en producción

### Variables de entorno en Vercel/Netlify:

```env
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
NEXT_PUBLIC_WOMPI_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-restaurante.com
```

## 📊 Monitoreo de Transacciones

Puedes ver todas tus transacciones en el dashboard de Wompi:

- Estado de pagos
- Transferencias a tu cuenta bancaria
- Reportes de ventas
- Disputas y devoluciones

## 💰 Comisiones de Wompi

Wompi cobra una comisión por transacción:

- **Tarjetas**: 3.49% + $900 COP
- **Nequi**: 1.99% + $900 COP
- **PSE**: 1.99% + $900 COP

Los pagos se transfieren automáticamente a tu cuenta bancaria cada 2-3 días hábiles.

## 🆘 Soporte

- **Documentación Wompi**: https://docs.wompi.co
- **Soporte Wompi**: soporte@wompi.co
- **Dashboard Wompi**: https://comercios.wompi.co

## 📁 Archivos Relevantes

```
restaurantes/
├── .env.local                          # Variables de entorno
├── utils/wompi.ts                      # Utilidades de Wompi
├── app/api/wompi/create-payment/route.ts   # API para crear pagos
├── app/payment/success/page.tsx        # Página de éxito
├── components/
│   ├── ReservationModal.tsx            # Modal de reservas con pago
│   └── OrderModal.tsx                  # Modal de pedidos con pago
└── WOMPI_CONFIG.md                     # Esta documentación
```

## ⚠️ Solución de Problemas

### Error: "Configuración de pagos no disponible"

- Verifica que `WOMPI_PRIVATE_KEY` esté configurada en `.env.local`
- Reinicia el servidor de desarrollo: `npm run dev`

### Error: "No se pudo crear el enlace de pago"

- Verifica que tus claves sean válidas
- Revisa que estés usando las claves correctas (test vs prod)
- Verifica la consola del navegador para más detalles

### El pago se completa pero no se envía a WhatsApp

- Verifica que el número de WhatsApp esté correcto
- Revisa la consola del navegador en `/payment/success`
- Asegúrate de que localStorage no esté bloqueado

## 📞 Contacto

Si tienes dudas sobre la implementación, revisa la documentación de Wompi o contacta a su soporte técnico.
