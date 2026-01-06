"use client";

import { useState } from "react";
import { X, User, Phone, MapPin, ShoppingBag, Home, Bike, Loader2, DollarSign } from "lucide-react";
import { createPaymentLink, generatePaymentReference, formatCOP } from "../utils/wompi";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal = ({ isOpen, onClose }: OrderModalProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    tipoServicio: "domicilio", // domicilio o recoger
    direccion: "",
    barrio: "",
    pedido: "",
    total: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

    if (formData.tipoServicio === "domicilio") {
      if (!formData.direccion.trim()) {
        newErrors.direccion = "La dirección es requerida para domicilio";
      }
      if (!formData.barrio.trim()) {
        newErrors.barrio = "El barrio es requerido para domicilio";
      }
    }

    if (!formData.pedido.trim()) {
      newErrors.pedido = "Describe tu pedido";
    }

    if (!formData.total || parseFloat(formData.total) <= 0) {
      newErrors.total = "Ingresa el total del pedido";
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
      const totalAmount = parseFloat(formData.total);

      // Generar referencia única
      const reference = generatePaymentReference('PEDIDO');

      // Crear descripción del pago
      const description = `Pedido - ${formData.nombre} - ${formData.tipoServicio}`;

      // URL de redirección después del pago (usa la variable de entorno o el origin actual)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/payment/success?type=pedido&reference=${reference}`;

      // Crear enlace de pago en Wompi
      const paymentData = await createPaymentLink({
        amount: totalAmount,
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

      // Guardar datos del pedido en localStorage para después del pago
      localStorage.setItem(`pedido_${reference}`, JSON.stringify({
        ...formData,
        total: totalAmount,
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

    } catch (error: unknown) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-secondary-500 to-primary-500 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Realiza tu Pedido</h2>
          <p className="text-white/90 text-sm">
            Completa el formulario y te contactaremos por WhatsApp
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

          {/* Tipo de servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de servicio *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, tipoServicio: "domicilio" }))
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.tipoServicio === "domicilio"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
                }`}
              >
                <Bike className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Domicilio
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, tipoServicio: "recoger" }))
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.tipoServicio === "recoger"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
                }`}
              >
                <Home className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Recoger
                </p>
              </button>
            </div>
          </div>

          {/* Dirección (solo si es domicilio) */}
          {formData.tipoServicio === "domicilio" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Dirección completa *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.direccion
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  placeholder="Ej: Calle 123 #45-67, Apto 301"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barrio *
                </label>
                <input
                  type="text"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.barrio
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                  placeholder="Ej: Chapinero"
                />
                {errors.barrio && (
                  <p className="text-red-500 text-sm mt-1">{errors.barrio}</p>
                )}
              </div>
            </>
          )}

          {/* Pedido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Describe tu pedido *
            </label>
            <textarea
              name="pedido"
              value={formData.pedido}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.pedido
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Ej: 2 pizzas medianas de pepperoni, 1 orden de alitas BBQ, 2 bebidas de 1.5L"
            />
            {errors.pedido && (
              <p className="text-red-500 text-sm mt-1">{errors.pedido}</p>
            )}
          </div>

          {/* Total del pedido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Total del pedido (COP) *
            </label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              min="0"
              step="1000"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.total
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
              placeholder="Ej: 50000"
            />
            {errors.total && (
              <p className="text-red-500 text-sm mt-1">{errors.total}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el valor total de tu pedido
            </p>
          </div>

          {/* Info importante */}
          <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-secondary-700 dark:text-secondary-400 mb-2">
                Información importante:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Pago 100% seguro a través de Wompi</li>
                <li>Puedes pagar con Nequi, PSE, tarjetas débito/crédito</li>
                <li>Te confirmaremos tu pedido por WhatsApp después del pago</li>
                <li>El costo de domicilio puede variar según tu ubicación</li>
              </ul>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary-500 to-primary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {formData.total ? `Pagar ${formatCOP(parseFloat(formData.total))}` : 'Procesar Pago'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
