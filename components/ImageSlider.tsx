"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ImageSliderProps {
  images: string[];
  category: string;
  title: string;
  autoplayInterval?: number;
}

export default function ImageSlider({
  images,
  category,
  title,
  autoplayInterval = 4000,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    pauseAutoplay();
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    pauseAutoplay();
  };

  const pauseAutoplay = () => {
    setIsAutoPlaying(false);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoplayInterval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, autoplayInterval, images.length]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full mb-8 mt-8 ">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 capitalize">{title}</h3>
      </div>

      <div className="relative overflow-hidden rounded-lg shadow-lg bg-white ">
        <div className="relative h-64 md:h-80 lg:h-96">
          <Image
            src={`/images/${category}_${images[currentIndex]}.jpg`}
            alt={`${title} ${images[currentIndex]}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority={currentIndex === 0}
          />

          {/* Navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 z-10 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 z-10 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Autoplay indicator */}
          <div className="absolute bottom-2 left-2 z-10">
            <div
              className={`w-3 h-3 rounded-full ${
                isAutoPlaying ? "bg-emerald-500" : "bg-red-500"
              } opacity-70`}
            ></div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center space-x-2 p-4 bg-white">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                pauseAutoplay();
              }}
              className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                index === currentIndex
                  ? "bg-emerald-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
