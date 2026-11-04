/**
 * Formas de pago que un restaurante ofrece a sus clientes, según lo que configuró:
 * - "online": checkout de ePayco con SU cuenta (tarjeta, PSE y Nequi si lo activó en ePayco).
 * - "nequi": transferencia directa a su Nequi; el pedido y el comprobante van por WhatsApp.
 * - "cash": pago al recibir, pedido por WhatsApp (solo si no hay pago en línea, como antes).
 */
import type { Branding } from "@/lib/branding";
import { formatNequi } from "@/lib/nequi";

export type PaymentOptionId = "online" | "nequi" | "cash";

export interface PaymentOption {
  id: PaymentOptionId;
  name: string;
  description: string;
}

export function paymentOptions(b: Pick<Branding, "onlinePayments" | "nequi">): PaymentOption[] {
  const options: PaymentOption[] = [];
  if (b.onlinePayments) {
    options.push({ id: "online", name: "Pago en línea", description: "Tarjeta débito/crédito, PSE o Nequi, con ePayco" });
  }
  if (b.nequi) {
    options.push({ id: "nequi", name: "Transferencia a Nequi", description: "Pagas desde tu app Nequi y envías el comprobante por WhatsApp" });
  }
  if (!b.onlinePayments) {
    options.push({ id: "cash", name: "Pago al recibir", description: "Pagas al recibir el pedido (o como acuerdes con el restaurante)" });
  }
  return options;
}

/** Línea de pago del mensaje de WhatsApp para las opciones que no pasan por ePayco. */
export function paymentNote(id: PaymentOptionId, nequi: string): string | undefined {
  if (id === "nequi") return `Pago por Nequi al ${formatNequi(nequi)}. Te envío el comprobante en este chat.`;
  if (id === "cash") return "Pago al recibir.";
  return undefined;
}
