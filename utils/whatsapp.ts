// Enlaces de WhatsApp. El número (solo dígitos con indicativo, p. ej. 573001234567)
// es el del restaurante actual: se obtiene con useBranding().whatsapp.

const link = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

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
