"use client";

import { useState } from "react";
import { X, Calendar, Users, Clock, User, Phone, CreditCard, Loader2 } from "lucide-react";
import { createPaymentLink, generatePaymentReference, formatCOP } from "../utils/wompi";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    fecha: "",
    hora: "",
    personas: "",
    comentarios: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const RESERVATION_FEE = 10000; // $10,000 COP

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^[0-9]{10}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Ingresa un número válido de 10 dígitos";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.fecha = "La fecha no puede ser anterior a hoy";
      }
    }

    if (!formData.hora) {
      newErrors.hora = "La hora es requerida";
    }

    if (!formData.personas) {
      newErrors.personas = "El número de personas es requerido";
    } else if (parseInt(formData.personas) < 1) {
      newErrors.personas = "Debe ser al menos 1 persona";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Generar referencia única
      const reference = generatePaymentReference('RESERVA');

      // Crear descripción del pago
      const description = `Reserva - ${formData.nombre} - ${formData.fecha} ${formData.hora} - ${formData.personas} personas`;

      // URL de redirección después del pago (usa la variable de entorno o el origin actual)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/payment/success?type=reserva&reference=${reference}`;

      // Crear enlace de pago en Wompi
      const paymentData = await createPaymentLink({
        amount: RESERVATION_FEE,
        currency: 'COP',
        reference,
        description,
        customerName: formData.nombre,
        customerPhone: formData.telefono,
        redirectUrl,
      });

      console.log('Payment data received:', paymentData);

      // La respuesta de Wompi tiene estructura { data: { data: {...} } }
      const paymentInfo = paymentData.data?.data || paymentData.data || paymentData;

      console.log('Payment info to use:', paymentInfo);

      // Guardar datos de la reserva en localStorage para después del pago
      localStorage.setItem(`reserva_${reference}`, JSON.stringify({
        ...formData,
        reference,
        paymentId: paymentInfo.id,
        createdAt: new Date().toISOString(),
      }));

      // Redirigir al checkout de Wompi
      if (paymentInfo && paymentInfo.id) {
        // Construir el permalink si no viene en la respuesta
        const checkoutUrl = paymentInfo.permalink || `https://checkout.wompi.co/l/${paymentInfo.id}`;
        console.log('Redirecting to:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se pudo crear el enlace de pago');
      }

    } catch (error: any) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex top-[65px] items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto ">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Reserva tu Mesa</h2>
          <p className="text-white/90 text-sm">
            Anticipo: $10.000 COP (se descuenta del total)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.telefono
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Ej: 3001234567"
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.fecha
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              />
              {errors.fecha && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Hora *
              </label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.hora
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              />
              {errors.hora && (
                <p className="text-red-500 text-sm mt-1">{errors.hora}</p>
              )}
            </div>
          </div>

          {/* Número de personas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Número de personas *
            </label>
            <select
              name="personas"
              value={formData.personas}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.personas
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
            >
              <option value="">Selecciona...</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "persona" : "personas"}
                </option>
              ))}
              <option value="11">Más de 10 personas</option>
            </select>
            {errors.personas && (
              <p className="text-red-500 text-sm mt-1">{errors.personas}</p>
            )}
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Preferencia de ubicación, alergias, etc."
            />
          </div>

          {/* Info importante */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-primary-700 dark:text-primary-400 mb-1">
                  Información importante:
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Anticipo de $10.000 COP requerido</li>
                  <li>Mesa reservada por 1 hora</li>
                  <li>El anticipo se descuenta del total de tu cuenta</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Pagar {formatCOP(RESERVATION_FEE)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
