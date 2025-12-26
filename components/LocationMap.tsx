"use client";

import { MapPin, Navigation, Phone, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";

interface LocationMapProps {
  businessName?: string;
  address?: string;
  phone?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
}

export default function LocationMap({
  businessName = "Tu Restaurante",
  address = "Calle 123 #45-67, Ciudad, País",
  phone = "+57 300 000 0000",
  hours = "Lun-Dom: 7:00 AM - 6:00 PM",
  latitude = 4.711,
  longitude = -74.0721,
}: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  // URL para Google Maps (web)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  // URL para obtener direcciones
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  // URL para el iframe del mapa embebido
  const embedMapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.514!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNDInNDAuOCJOIDc0wrAwNCcxOS42Ilc!5e0!3m2!1ses!2sco!4v1234567890!5m2!1ses!2sco`;

  const handleGetDirections = () => {
    window.open(directionsUrl, "_blank");
  };

  const handleOpenMap = () => {
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📍 Encuéntranos Aquí
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visítanos en nuestra ubicación o solicita delivery. ¡Estamos listos
            para atenderte!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del Negocio */}
          <div className="space-y-6">
            {/* Tarjeta de Información */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {businessName}
              </h3>

              {/* Dirección */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Dirección
                  </h4>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {address}
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Teléfono
                  </h4>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="text-gray-900 dark:text-white font-medium hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Horario
                  </h4>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {hours}
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  onClick={handleGetDirections}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Cómo Llegar</span>
                </button>

                <button
                  onClick={handleOpenMap}
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Abrir en Google Maps</span>
                </button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                <strong className="text-primary-600 dark:text-primary-400">
                  💡 Consejo:
                </strong>{" "}
                Haz clic en <span className="font-bold text-">Cómo Llegar</span> para obtener direcciones desde tu
                ubicación actual. También ofrecemos servicio de delivery a
                domicilio.
              </p>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-full min-h-[500px]">
              {/* Skeleton loader mientras carga el mapa */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cargando mapa...
                    </p>
                  </div>
                </div>
              )}

              {/* Google Maps Embed */}
              <iframe
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "500px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoaded(true)}
                className="rounded-2xl"
                title={`Ubicación de ${businessName}`}
              />
            </div>

            {/* Marcador personalizado (opcional, se muestra sobre el iframe) */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <MapPin className="w-6 h-6 text-primary-500 dark:text-primary-400 animate-pulse-slow" />
            </div>
          </div>
        </div>

        {/* Call to Action adicional */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              ¿Prefieres que llevemos la comida hasta ti?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Solicita nuestro servicio de delivery y disfruta de nuestros
              platillos en la comodidad de tu hogar
            </p>
            <button
              onClick={() => {
                const deliverySection = document.getElementById("delivery");
                if (deliverySection) {
                  deliverySection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <span>🏍️ Ver Opciones de Delivery</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
