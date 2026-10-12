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
  address = "Calle 123 #45-67, Ciudad",
  phone = "+57 300 000 0000",
  hours = "Lun-Dom: 11:00 AM - 6:00 PM",
  latitude,
  longitude,
}: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  // El mapa se ubica por coordenadas si se dan; si no, por la dirección (así sirve para cualquier ciudad)
  const place =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : encodeURIComponent(`${address}, Colombia`);

  // URL para Google Maps (web)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place}`;

  // URL para obtener direcciones
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place}`;

  // URL para el iframe del mapa embebido
  const embedMapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${place}&zoom=15`;

  const handleGetDirections = () => {
    window.open(directionsUrl, "_blank");
  };

  const handleOpenMap = () => {
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <section className="px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-10 max-w-2xl" data-aos="fade-up">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-950 dark:text-white mb-4"
            id="contacto"
          >
            Dónde estamos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Venga a almorzar con nosotros o pida a domicilio. Lo esperamos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del Negocio */}
          <div className="space-y-6">
            {/* Tarjeta de Información */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800">
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
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-full font-semibold flex items-center justify-center space-x-3"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Cómo llegar</span>
                </button>

                <button
                  onClick={handleOpenMap}
                  className="w-full bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 px-6 py-3.5 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center space-x-3"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Abrir en Google Maps</span>
                </button>
              </div>
            </div>

          </div>

          {/* Mapa */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 h-full min-h-[420px]">
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
                style={{ border: 0, minHeight: "420px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoaded(true)}
                className="rounded-3xl"
                title={`Ubicación de ${businessName}`}
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
