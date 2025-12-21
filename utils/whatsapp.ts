const whatsappNumber = "3215557890";

export const createWhatsAppMessage = (pizzaName: string, price: string) => {
  const message = `¡Hola! Me interesa ordenar una pizza *${pizzaName}* (${price}). ¿Podrían ayudarme con el pedido?`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const generalWhatsAppMessage = () => {
  const message = "¡Hola! Me gustaría hacer un pedido de pizza. ¿Podrían ayudarme?";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const createFoodMenuMessage = () => {
  const message = "¡Hola! Me interesa ver el menú completo de comidas disponibles. ¿Podrían enviarme las opciones y precios de sus platos? 🍽️";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const createDeliveryMessage = (address?: string) => {
  const baseMessage = "🏠 ¡Hola! Me gustaría solicitar un pedido a domicilio.";
  const addressMessage = address
    ? ` Mi dirección es: *${address}*.`
    : "";
  const deliveryInfo = "\n\n📍 ¿Hacen envíos a mi zona y cuál es el costo de envío?\n💳 Entiendo que el costo de envío se debe pagar antes de que salga el repartidor.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(baseMessage + addressMessage + deliveryInfo)}`;
};

export const createTableReservationMessage = () => {
  const message = "📅 ¡Hola! Me gustaría hacer una reserva para comer en el restaurante. ¿Tienen disponibilidad?";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};