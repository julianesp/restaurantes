"use client";

import { useEffect, useState } from "react";

interface PulseAnimationProps {
  children: React.ReactNode;
  interval?: number; // Intervalo en milisegundos (default: 5000)
  duration?: number; // Duración de la animación (default: 1000)
  className?: string;
}

export default function PulseAnimation({
  children,
  interval = 5000,
  duration = 1000,
  className = "",
}: PulseAnimationProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Función para activar el pulso
    const triggerPulse = () => {
      setIsPulsing(true);
      setTimeout(() => {
        setIsPulsing(false);
      }, duration);
    };

    // Ejecutar el pulso inmediatamente al montar
    triggerPulse();

    // Configurar intervalo para pulsos repetidos
    const pulseInterval = setInterval(triggerPulse, interval);

    // Limpiar intervalo al desmontar
    return () => clearInterval(pulseInterval);
  }, [interval, duration]);

  return (
    <div className={`relative ${className}`}>
      {children}

      {/* Anillo de pulso exterior */}
      {isPulsing && (
        <>
          <span
            className="absolute inset-0 rounded-full bg-primary-400/30 animate-ping"
            style={{
              animationDuration: `${duration}ms`,
              animationIterationCount: "1",
            }}
          />
          <span
            className="absolute inset-0 rounded-full bg-primary-500/20 animate-pulse"
            style={{
              animationDuration: `${duration * 0.8}ms`,
              animationIterationCount: "1",
            }}
          />
        </>
      )}
    </div>
  );
}
