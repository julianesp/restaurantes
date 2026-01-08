"use client";

import PulseAnimation from "./PulseAnimation";

interface FloatingActionButtonsProps {
  onReservaClick: () => void;
  onPedirClick: () => void;
}

export default function FloatingActionButtons({
  onReservaClick,
  onPedirClick,
}: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 items-center justify-center">
      <PulseAnimation interval={5000} duration={1200}>
        <button
          onClick={onReservaClick}
          className="relative group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-500 overflow-hidden btn-animated"
        >
          <span className="relative z-10">Reserva</span>
        </button>
      </PulseAnimation>

      <PulseAnimation interval={5000} duration={1200}>
        <button
          onClick={onPedirClick}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-500 hover:shadow-xl font-semibold transform hover:-translate-y-1 hover:scale-105 w-max"
        >
          Pedir Ahora
        </button>
      </PulseAnimation>
    </div>
  );
}
