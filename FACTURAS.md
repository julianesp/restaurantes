# Sistema de Facturas PDF

El sistema de facturas permite a los clientes descargar un comprobante de pago profesional después de completar su reserva o pedido.

## 📋 Características

### Facturas Automáticas
- ✅ Generación automática después del pago exitoso
- ✅ Formato PDF profesional con diseño del restaurante
- ✅ Información completa del cliente y transacción
- ✅ Estado de pago claramente marcado como "PAGADO"
- ✅ Compatible con modo claro y oscuro

### Tipos de Facturas

#### 1. Factura de Reserva
Incluye:
- Referencia única del pago
- Datos del cliente (nombre y teléfono)
- Fecha y hora de la reserva
- Número de personas
- Comentarios adicionales
- Monto del anticipo ($10,000 COP)
- Información sobre la reserva (1 hora de validez)

#### 2. Factura de Pedido
Incluye:
- Referencia única del pago
- Datos del cliente (nombre y teléfono)
- Tipo de servicio (Domicilio o Recoger)
- Dirección de entrega (si aplica)
- Detalle completo del pedido
- Total pagado

## 🎨 Diseño de la Factura

### Header
- Logo y nombre del restaurante con colores del tema
- Título "Factura de Pago"
- Fondo gradiente azul

### Cuerpo
- Tipo de transacción (Reserva/Pedido)
- Badge verde con estado "PAGADO"
- Datos del cliente en tarjeta gris
- Detalles específicos según el tipo
- Tabla con resumen de pago

### Footer
- Información de contacto
- WhatsApp
- URL del sitio web

## 🔄 Flujo de Uso

```
Cliente Paga → Página de Éxito → Botón "Ver y Descargar Factura" → Página de Factura
                                                                          ↓
                                                                    [Ver] [Descargar]
```

### Después del Pago:
1. Cliente completa el pago en Wompi
2. Es redirigido a `/payment/success`
3. Ve mensaje de confirmación
4. Puede hacer clic en "Ver y Descargar Factura"
5. Es llevado a `/invoice?type=X&reference=Y`

### En la Página de Factura:
1. Se muestra resumen visual de la transacción
2. Dos botones disponibles:
   - **Ver Factura**: Abre el PDF en nueva pestaña
   - **Descargar PDF**: Descarga directamente el archivo

## 📁 Archivos del Sistema

```
restaurantes/
├── utils/
│   └── invoice.ts                    # Utilidad para generar PDFs
├── app/
│   ├── invoice/
│   │   └── page.tsx                  # Página de visualización
│   └── payment/success/
│       └── page.tsx                  # Actualizada con botón de factura
└── FACTURAS.md                       # Esta documentación
```

## 🛠️ Tecnologías Utilizadas

- **jsPDF**: Librería para generar PDFs en el navegador
- **jspdf-autotable**: Plugin para crear tablas en los PDFs
- **React**: Framework del frontend
- **Next.js**: Framework de la aplicación
- **LocalStorage**: Almacenamiento temporal de datos de transacción

## 💾 Almacenamiento de Datos

Los datos de la transacción se almacenan temporalmente en el navegador:

```javascript
localStorage.setItem(`reserva_${reference}`, JSON.stringify({
  nombre: "...",
  telefono: "...",
  fecha: "...",
  // ... más datos
}));
```

### Importante:
- Los datos persisten en el navegador del cliente
- Se pueden acceder mientras el navegador no limpie el localStorage
- No se almacenan en el servidor (privacidad del cliente)

## 🎯 Funciones Disponibles

### generateInvoicePDF(data)
Genera un objeto jsPDF con la factura formateada.

```typescript
const doc = generateInvoicePDF({
  reference: "RESERVA-ABC123",
  type: "reserva",
  customerName: "Juan Pérez",
  customerPhone: "3001234567",
  amount: 10000,
  date: "2026-01-06T10:30:00",
  // ... datos adicionales
});
```

### downloadInvoice(data)
Genera y descarga automáticamente el PDF.

```typescript
downloadInvoice({
  reference: "RESERVA-ABC123",
  type: "reserva",
  // ... datos
});
```

### viewInvoice(data)
Genera y abre el PDF en una nueva pestaña del navegador.

```typescript
viewInvoice({
  reference: "RESERVA-ABC123",
  type: "reserva",
  // ... datos
});
```

## 🎨 Personalización

### Colores
Los colores se definen en `utils/invoice.ts`:

```typescript
const primaryColor = '#3B82F6';   // Azul primario
const secondaryColor = '#10B981';  // Verde secundario
```

Puedes cambiarlos para que coincidan con tu marca.

### Información del Restaurante

Actualiza la siguiente información en `utils/invoice.ts`:

```typescript
// Nombre del restaurante (línea ~30)
doc.text('Tu Restaurante', 105, 20, { align: 'center' });

// Footer (líneas ~160-165)
doc.text('WhatsApp: +57 317 450 3604', 105, pageHeight - 12);
doc.text('https://restaurantes-phi.vercel.app', 105, pageHeight - 6);
```

### Logo
Para agregar un logo:

1. Convierte tu logo a base64
2. Agrega en el header:

```typescript
const logoBase64 = "data:image/png;base64,...";
doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
```

## 📱 Responsividad

Las facturas PDF tienen tamaño A4 (210 x 297 mm) y se ven perfectamente en:
- 💻 Desktop
- 📱 Mobile
- 🖨️ Impresión

## 🔒 Privacidad

- ✅ Los datos NO se almacenan en el servidor
- ✅ Los datos permanecen en el navegador del cliente
- ✅ El PDF se genera en el cliente (sin envío a servidor)
- ✅ El cliente controla sus propios datos

## 📊 Información en la Factura

### Campos Comunes (Ambos Tipos)
- Referencia única
- Fecha de emisión
- Nombre del cliente
- Teléfono del cliente
- Estado del pago
- Método de pago (Wompi)
- Total pagado

### Campos Específicos de Reserva
- Fecha de la reserva
- Hora de la reserva
- Número de personas
- Comentarios adicionales
- Duración de la reserva (1 hora)
- Información sobre el anticipo

### Campos Específicos de Pedido
- Tipo de servicio (Domicilio/Recoger)
- Dirección de entrega
- Barrio
- Detalle completo del pedido
- Total del pedido

## 🚀 Mejoras Futuras

Posibles mejoras al sistema:

1. **Base de Datos**: Almacenar facturas en BD para historial
2. **Email**: Enviar factura automáticamente por correo
3. **QR Code**: Agregar código QR para verificación
4. **Numeración**: Sistema de numeración secuencial de facturas
5. **Impuestos**: Desglose de impuestos si aplica
6. **Firma Digital**: Firma electrónica del restaurante

## 🆘 Solución de Problemas

### "Datos de la factura no encontrados"
- El localStorage fue limpiado
- El cliente cambió de navegador
- Los datos expiraron

**Solución**: El cliente debe completar el pago nuevamente o contactar al restaurante.

### "Error al generar PDF"
- Problema con jsPDF
- Datos faltantes o inválidos

**Solución**: Verificar que todos los datos requeridos estén presentes.

### El PDF se ve mal en mobile
- Esto es normal, los PDFs están optimizados para A4
- Sugerir descargar y ver en visor de PDF nativo

## 📞 Soporte

Para dudas o problemas con el sistema de facturas, contacta al equipo de desarrollo.

---

**Última actualización**: 2026-01-06
