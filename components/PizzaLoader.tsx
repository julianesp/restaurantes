"use client";

import { useEffect, useState } from "react";
import "../styles/PizzaLoader.module.scss";

export default function PizzaLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Bienvenido a Tu Restaurante";

  useEffect(() => {
    // Animación de texto letra por letra
    let currentIndex = 0;
    const intervalTime = 2000 / fullText.length; // 2 segundos dividido por el número de caracteres

    const textInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
      }
    }, intervalTime);

    // Ocultar el loader después de 3.5 segundos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="pizza-loader-container">
      <div className="pizza-loader">
        {/* Trozo 1 - Superior izquierdo */}
        <div className="pizza-slice slice-1">
          <div className="crust-border crust-slice-1">
            <div className="crust-bump crust-bump-1"></div>
            <div className="crust-bump crust-bump-2"></div>
            <div className="crust-bump crust-bump-3"></div>
            <div className="crust-bump crust-bump-4"></div>
          </div>
          <div className="slice-content">
            <div className="pizza-sauce"></div>
            <div className="pepperoni pepperoni-1"></div>
            <div className="pepperoni pepperoni-2"></div>
            <div className="cheese-bubble bubble-1"></div>
          </div>
        </div>

        {/* Trozo 2 - Superior derecho */}
        <div className="pizza-slice slice-2">
          <div className="crust-border crust-slice-2">
            <div className="crust-bump crust-bump-1"></div>
            <div className="crust-bump crust-bump-2"></div>
            <div className="crust-bump crust-bump-3"></div>
            <div className="crust-bump crust-bump-4"></div>
          </div>
          <div className="slice-content">
            <div className="pizza-sauce"></div>
            <div className="pepperoni pepperoni-3"></div>
            <div className="pepperoni pepperoni-4"></div>
            <div className="cheese-bubble bubble-2"></div>
          </div>
        </div>

        {/* Trozo 3 - Inferior izquierdo */}
        <div className="pizza-slice slice-3">
          <div className="crust-border crust-slice-3">
            <div className="crust-bump crust-bump-1"></div>
            <div className="crust-bump crust-bump-2"></div>
            <div className="crust-bump crust-bump-3"></div>
            <div className="crust-bump crust-bump-4"></div>
          </div>
          <div className="slice-content">
            <div className="pizza-sauce"></div>
            <div className="pepperoni pepperoni-5"></div>
            <div className="cheese-bubble bubble-3"></div>
          </div>
        </div>

        {/* Trozo 4 - Inferior derecho */}
        <div className="pizza-slice slice-4">
          <div className="crust-border crust-slice-4">
            <div className="crust-bump crust-bump-1"></div>
            <div className="crust-bump crust-bump-2"></div>
            <div className="crust-bump crust-bump-3"></div>
            <div className="crust-bump crust-bump-4"></div>
          </div>
          <div className="slice-content">
            <div className="pizza-sauce"></div>
            <div className="pepperoni pepperoni-6"></div>
            <div className="cheese-bubble bubble-4"></div>
          </div>
        </div>
      </div>

      <div className="loading-text">
        <div className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
        <span className="mensaje-loader">{displayText}</span>
        <div className="loading-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
