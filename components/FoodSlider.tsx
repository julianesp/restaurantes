"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import Image from "next/image";

interface FoodItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price?: string;
}

interface FoodSliderProps {
  foods: FoodItem[];
  autoplayInterval?: number;
}

export default function FoodSlider({
  foods,
  autoplayInterval = 4000,
}: FoodSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? foods.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === foods.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (!isAutoPlaying) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === foods.length - 1 ? 0 : prevIndex + 1
      );
    }, autoplayInterval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, autoplayInterval, foods.length]);

  if (!foods || foods.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0">
      <div className="relative overflow-hidden h-full shadow-none">
        <div className="relative h-full">
          {foods.map((food, index) => {
            const active = index === currentIndex;
            return (
              <div
                key={food.id}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  active ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 z-10"></div>

                {food.image ? (
                  // Zoom lento mientras la foto está activa (sustituye al parallax por scroll)
                  <div
                    className={`absolute inset-0 overflow-hidden transition-transform ease-linear motion-reduce:transition-none ${
                      active ? "scale-100" : "scale-[1.08]"
                    }`}
                    style={{ transitionDuration: active ? `${autoplayInterval + 1500}ms` : "0ms" }}
                  >
                    <Image
                      src={food.image}
                      alt={food.name}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20">
                      {food.name.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Texto: el saliente se va rápido y el entrante llega después, así nunca se encima */}
                <div
                  className={`absolute bottom-40 md:top-1/2 md:bottom-auto left-0 right-0 md:right-auto z-20 mx-auto md:mx-0 w-[min(88%,28rem)] md:w-auto md:max-w-2xl rounded-3xl md:rounded-none bg-black/35 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 lg:p-10 text-white text-center md:text-left transition-[opacity,transform,filter] motion-reduce:transition-opacity ${
                    active
                      ? "opacity-100 translate-y-0 blur-0 duration-500 delay-300 ease-out"
                      : "opacity-0 translate-y-2 blur-[4px] duration-150 delay-0 ease-out"
                  }`}
                >
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                    {food.name}
                  </h3>
                  <p className="text-sm md:text-base lg:text-lg mb-4 max-w-xl text-white/85 drop-shadow-md line-clamp-2 mx-auto md:mx-0">
                    {food.description}
                  </p>
                  {food.price && (
                    <div className="inline-block bg-primary-600 px-5 py-2 rounded-full">
                      <span className="text-xl md:text-2xl font-bold tabular-nums">{food.price}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Navegación */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white p-2 md:p-3 rounded-full shadow-lg"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white p-2 md:p-3 rounded-full shadow-lg"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={toggleAutoplay}
            className="absolute bottom-4 right-2 md:right-4 z-30 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white p-2 md:p-3 rounded-full shadow-lg"
            aria-label={isAutoPlaying ? "Pausar" : "Reproducir"}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        </div>

        {/* Barra de progreso: un solo color, animada con transform (no con width) */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
            <div
              key={currentIndex}
              className="h-full w-full origin-left bg-primary-400"
              style={{ animation: `slider-progress ${autoplayInterval}ms linear forwards` }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slider-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
