"use client";

import { useState } from "react";
import { CreditCard, Smartphone, Banknote, Copy, Check } from "lucide-react";
import { useBranding } from "@/context/TenantContext";
import { formatNequi } from "@/lib/nequi";
import type { PaymentOption, PaymentOptionId } from "@/lib/payment-options";

// Selector de forma de pago de los pedidos (checkout y modal de pedido). Las opciones salen de
// paymentOptions(): pago en línea con ePayco, transferencia a Nequi o pago al recibir.

const ICONS: Record<PaymentOptionId, React.ElementType> = { online: CreditCard, nequi: Smartphone, cash: Banknote };

const cop = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export default function PaymentChoice({
  options,
  value,
  onChange,
  total,
}: {
  options: PaymentOption[];
  value: PaymentOptionId;
  onChange: (id: PaymentOptionId) => void;
  total: number;
}) {
  const { nequi, nequiHolder } = useBranding();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nequi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el número sigue visible para copiarlo a mano
    }
  };

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Forma de pago" className="space-y-3">
      {options.map((option) => {
        const Icon = ICONS[option.id];
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              selected
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
            }`}
          >
            <div
              className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${
                selected ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 dark:text-white">{option.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
            </div>
            <div
              className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                selected ? "border-primary-500 bg-primary-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selected && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
          </button>
        );
      })}
      </div>

      {value === "nequi" && nequi && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 text-sm text-gray-700 dark:text-gray-300">
          <p className="mb-2">
            Transfiere <strong className="text-gray-900 dark:text-white">{cop(total)}</strong> a este Nequi:
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">{formatNequi(nequi)}</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          {nequiHolder && <p className="mt-1">A nombre de {nequiHolder}</p>}
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Al confirmar se abre WhatsApp con tu pedido: envía ahí el comprobante. El restaurante prepara el pedido cuando
            confirma el pago.
          </p>
        </div>
      )}
    </div>
  );
}
