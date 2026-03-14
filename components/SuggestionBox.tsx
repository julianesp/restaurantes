'use client';

import { useState } from 'react';

interface SuggestionFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  rating: number;
  suggestion_type: string;
}

interface SuggestionBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionBox({ isOpen, onClose }: SuggestionBoxProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<SuggestionFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    rating: 0,
    suggestion_type: 'general',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      alert('Por favor escribe tu mensaje o sugerencia');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          message: formData.message,
          rating: formData.rating || null,
          suggestion_type: formData.suggestion_type,
        }),
      });

      const data = await response.json();

      console.log('Respuesta del servidor:', { status: response.status, data });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          rating: 0,
          suggestion_type: 'general',
        });

        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Error desconocido al enviar la sugerencia';
        setErrorMessage(errorMsg);
        console.error('Error del servidor:', {
          status: response.status,
          error: data.error,
          details: data.details,
          hint: data.hint,
          fullData: data,
        });
      }
    } catch (error) {
      console.error('Error al enviar sugerencia:', error);
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Por favor verifica tu conexión a internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Buzón de Sugerencias</h2>
                <button
                  onClick={() => onClose()}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Cerrar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-blue-100">
                Tu opinión es muy importante para nosotros. Déjanos tus comentarios de forma privada.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Información de contacto (opcional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              {/* Tipo de sugerencia */}
              <div>
                <label htmlFor="suggestion_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de comentario
                </label>
                <select
                  id="suggestion_type"
                  name="suggestion_type"
                  value={formData.suggestion_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="food">Comida</option>
                  <option value="service">Servicio</option>
                  <option value="atmosphere">Ambiente</option>
                  <option value="complaint">Queja</option>
                  <option value="compliment">Felicitación</option>
                </select>
              </div>

              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación general (opcional)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: star }))
                      }
                      className={`text-3xl transition-all ${
                        star <= formData.rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cuéntanos tu experiencia, sugerencias o comentarios..."
                />
              </div>

              {/* Estado de envío */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  ¡Gracias por tu comentario! Lo hemos recibido correctamente.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <p className="font-medium">Hubo un error al enviar tu mensaje.</p>
                  {errorMessage && <p className="text-sm mt-1">{errorMessage}</p>}
                </div>
              )}

              {/* Botón de envío */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Sugerencia'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Tus comentarios son privados y solo serán vistos por nuestro equipo.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
