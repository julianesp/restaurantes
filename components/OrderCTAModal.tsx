"use client";

import { useState } from "react";
import { X, Bike, Utensils } from "lucide-react";
import Link from "next/link";
import {
  createDeliveryMessage,
  createTableReservationMessage,
} from "../utils/whatsapp";
import ReservationModal from "./ReservationModal";

interface OrderCTAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderCTAModal = ({ isOpen, onClose }: OrderCTAModalProps) => {
  const [showReservationModal, setShowReservationModal] = useState(false);

  const handleReservation = () => {
    setShowReservationModal(true);
    onClose(); // Cerrar el modal principal al abrir el de reserva
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-gradient-to-r from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-accent-600 to-primary-600 text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-bold mb-2">¿Listo para pedir?</h2>
            <p className="text-white/90">
              Haz tu pedido por WhatsApp y disfruta de comida deliciosa en tu
              casa. ¡Te llevamos el sabor hasta tu puerta!
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch">
              {/* Solicitar Entrega */}
              <Link
                href={createDeliveryMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group"
                onClick={onClose}
              >
                <div className="h-full bg-gradient-to-br from-accent-600 to-primary-600 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bike className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold">Solicitar Entrega</h3>
                    <p className="text-sm text-white/90">
                      Recibe tu pedido en la comodidad de tu hogar. Servicio
                      rápido con mototaxistas locales.
                    </p>
                    <div className="pt-2">
                      <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                        Tiempo: 30-45 min
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Reservar Mesa */}
              <button
                onClick={handleReservation}
                className="flex-1 group"
              >
                <div className="h-full bg-white dark:bg-gray-700 border-2 border-gray-900 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl p-6 shadow-lg hover:shadow-2xl hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/50 group-hover:bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <Utensils className="w-10 h-10 text-primary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold">Reservar Mesa</h3>
                    <p className="text-sm group-hover:text-white/90 transition-colors duration-300">
                      Asegura tu lugar en nuestro restaurante. Disfruta de una
                      experiencia gastronómica única.
                    </p>
                    <div className="pt-2">
                      <span className="inline-block bg-primary-100 dark:bg-primary-900/50 group-hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300">
                        Anticipo: $10.000
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                💡 También puedes llamarnos al <strong>321-555-7890</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reservación */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
      />
    </>
  );
};

export default OrderCTAModal;
