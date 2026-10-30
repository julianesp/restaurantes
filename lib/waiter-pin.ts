// Reglas del PIN de los meseros. Puro: lo usan /api/waiters y el formulario de /admin/meseros.
// Con 6 dígitos hay 1.000.000 de combinaciones; junto al límite de intentos de
// /api/waiters/verify (30 fallos por restaurante cada 15 min) adivinarlo tomaría años.

export const PIN_MIN_LENGTH = 6;
export const PIN_MAX_LENGTH = 8;

const PIN_REGEX = new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`);

export const PIN_RULE_TEXT = `El PIN debe tener entre ${PIN_MIN_LENGTH} y ${PIN_MAX_LENGTH} dígitos`;

export function isValidPin(pin: unknown): pin is string {
  return typeof pin === "string" && PIN_REGEX.test(pin);
}
