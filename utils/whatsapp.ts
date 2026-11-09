// Enlaces de WhatsApp. El número (solo dígitos con indicativo, p. ej. 573001234567)
// es el del restaurante actual: se obtiene con useBranding().whatsapp.

/** wa.me exige el indicativo: un celular colombiano de 10 dígitos se completa con 57. */
export const waNumber = (number: string) => {
  const digits = number.replace(/\D/g, "");
  return digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits;
};

const link = (number: string, message: string) =>
  `https://wa.me/${waNumber(number)}?text=${encodeURIComponent(message)}`;

/**
 * Pedido de un plato concreto desde el sitio: el restaurante recibe el nombre, el precio y el
 * enlace a su carta, así el mesero o el dueño sabe exactamente qué mandar a preparar.
 */
export const createDishOrderMessage = (
  number: string,
  dish: { name: string; price?: string | null; restaurant?: string; url?: string },
) => {
  const lines = [
    `🍽️ ¡Hola${dish.restaurant ? ` ${dish.restaurant}` : ""}! Quiero pedir:`,
    "",
    `• 1 x *${dish.name}*${dish.price ? ` — ${dish.price}` : ""}`,
  ];
  if (dish.url) lines.push("", `Lo vi en ${dish.url}`);
  return link(number, lines.join("\n"));
};

export const createWhatsAppMessage = (dishName: string, price: string, number: string) =>
  link(number, `¡Hola! Me interesa ordenar *${dishName}* (${price}). ¿Podrían ayudarme con el pedido?`);

export const generalWhatsAppMessage = (number: string) =>
  link(number, "¡Hola! Me gustaría hacer un pedido. ¿Podrían ayudarme?");

export const createFoodMenuMessage = (number: string) =>
  link(number, "¡Hola! Me interesa ver el menú completo de comidas disponibles. ¿Podrían enviarme las opciones y precios de sus platos? 🍽️");

export const createDeliveryMessage = (number: string, address?: string) => {
  const baseMessage = "🏠 ¡Hola! Me gustaría solicitar un pedido a domicilio.";
  const addressMessage = address ? ` Mi dirección es: *${address}*.` : "";
  const deliveryInfo = "\n\n📍 ¿Hacen envíos a mi zona y cuál es el costo de envío?\n💳 Entiendo que el costo de envío se debe pagar antes de que salga el repartidor.";
  return link(number, baseMessage + addressMessage + deliveryInfo);
};

export const createTableReservationMessage = (number: string) =>
  link(number, "📅 ¡Hola! Me gustaría hacer una reserva para comer en el restaurante. ¿Tienen disponibilidad?");

export interface WhatsAppOrder {
  name: string;
  phone?: string;
  /** "domicilio", "recoger"… */
  service?: string;
  address?: string;
  notes?: string;
  /** Cómo paga el cliente (lib/payment-options.ts paymentNote) */
  payment?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

const cop = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

/** Pedido completo por WhatsApp (pago al recibir o por Nequi directo). */
export const createOrderMessage = (number: string, order: WhatsAppOrder) => {
  const lines = [
    "🛒 ¡Hola! Quiero hacer este pedido:",
    "",
    ...order.items.map((i) => `• ${i.quantity} x ${i.name} — ${cop(i.price * i.quantity)}`),
    "",
    `*Total: ${cop(order.total)}*`,
    "",
    `👤 ${order.name}${order.phone ? ` · ${order.phone}` : ""}`,
  ];
  if (order.service) lines.push(`🚚 ${order.service}`);
  if (order.address) lines.push(`📍 ${order.address}`);
  if (order.notes) lines.push(`📝 ${order.notes}`);
  if (order.payment) lines.push(`💳 ${order.payment}`);
  return link(number, lines.join("\n"));
};

/** Reserva por WhatsApp (sin cobro de anticipo en línea). */
export const createReservationDetailsMessage = (
  number: string,
  r: { name: string; phone?: string; date: string; time: string; people: string | number; notes?: string }
) =>
  link(
    number,
    [
      "📅 ¡Hola! Quiero reservar una mesa:",
      `👤 ${r.name}${r.phone ? ` · ${r.phone}` : ""}`,
      `🗓️ ${r.date} a las ${r.time}`,
      `👥 ${r.people} personas`,
      ...(r.notes ? [`📝 ${r.notes}`] : []),
    ].join("\n")
  );
