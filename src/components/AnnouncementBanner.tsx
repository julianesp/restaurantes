"use client";

export default function AnnouncementBanner() {
  return (
    <div className="w-full bg-[#0c6b58]/80 shadow-2xl text-white overflow-hidden py-3 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="animate-scroll whitespace-nowrap inline-flex">
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA HALLOWEEN 🍕 por $43.900! ¡Conócela
          ahora! 🎃
        </span>
        {/* <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA HALLOWEEN 🍕 por $43.900! ¡Conócela
          ahora! 🎃
        </span>
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA HALLOWEEN 🍕 por $43.900! ¡Conócela
          ahora! 🎃
        </span>
        <span className="text-lg font-bold mx-8">
          🎃 ¡Disfruta nuestro COMBO PIZZA HALLOWEEN 🍕 por $43.900! ¡Conócela
          ahora! 🎃
        </span> */}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(1200px);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 15s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
