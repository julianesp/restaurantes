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

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!foods || foods.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full top-18">
      {/* Main Slider Container */}
      <div className="relative overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        {/* Image Section */}
        <div className="relative h-[40vh] min-h-[300px] max-h-[500px]">
          {foods.map((food, index) => (
            <div
              key={food.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>

              {food.image ? (
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-20">
                    {food.name.charAt(0)}
                  </div>
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 lg:p-8 text-white">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                  {food.name}
                </h3>
                <p className="text-sm md:text-base lg:text-lg mb-3 max-w-2xl drop-shadow-md line-clamp-2">
                  {food.description}
                </p>
                {food.price && (
                  <div className="inline-block bg-primary-500 dark:bg-primary-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full">
                    <span className="text-xl md:text-2xl font-bold">
                      {food.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={toggleAutoplay}
            className="absolute top-2 md:top-4 right-2 md:right-4 z-30 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label={isAutoPlaying ? "Pausar" : "Reproducir"}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center space-x-2 md:space-x-3 p-3 md:p-4 bg-white dark:bg-gray-800">
          {foods.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 md:w-10 h-2 md:h-2.5 bg-primary-500 dark:bg-primary-600"
                  : "w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-20">
            <div
              className="h-full bg-primary-500 dark:bg-primary-600 transition-all"
              style={{
                animation: `progress ${autoplayInterval}ms linear`,
                animationPlayState: isAutoPlaying ? "running" : "paused",
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
