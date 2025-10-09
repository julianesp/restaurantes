"use client";

export default function AnnouncementBanner() {
  return (
    <div className="w-full bg-red-600 text-white overflow-hidden py-3 fixed top-0 left-0 right-0 z-50">
      <div className="animate-scroll whitespace-nowrap inline-block">
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA CALABAZA 🍕 por $43.900! ¡Conócela ahora! 🎃
        </span>
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA CALABAZA 🍕 por $43.900! ¡Conócela ahora! 🎃
        </span>
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA CALABAZA 🍕 por $43.900! ¡Conócela ahora! 🎃
        </span>
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA CALABAZA 🍕 por $43.900! ¡Conócela ahora! 🎃
        </span>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
