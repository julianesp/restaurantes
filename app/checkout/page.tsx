"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar/page";
import Footer from "../../containers/Footer/page";
import { useCart } from "../../context/CartContext";
import { createPaymentLink, generatePaymentReference } from "../../utils/wompi";
import {
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit-card",
    name: "Tarjeta de Crédito/Débito",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "transfer",
    name: "Transferencia Bancaria",
    icon: Building2,
    description: "PSE - Pago Seguro en Línea",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string>("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-CO")}`;
  };

  const deliveryCost = 3000;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Generar referencia única para el pedido
      const reference = generatePaymentReference('PEDIDO');

      // Crear descripción del pedido
      const itemsDescription = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const description = `Pedido Restaurante Munay - ${itemsDescription}`;

      // URL de retorno después del pago
      const redirectUrl = `${window.location.origin}/payment/success?reference=${reference}`;

      // Crear enlace de pago en Wompi
      const paymentData = await createPaymentLink({
        amount: total,
        currency: 'COP',
        reference: reference,
        description: description,
        customerEmail: formData.email,
        customerName: formData.name,
        customerPhone: formData.phone,
        redirectUrl: redirectUrl,
      });

      // Guardar información del pedido en localStorage para recuperarla después del pago
      localStorage.setItem('pending-order', JSON.stringify({
        reference,
        cart,
        formData,
        total,
        timestamp: Date.now(),
      }));

      // Redirigir a Wompi
      if (paymentData.data && paymentData.data.id) {
        window.location.href = `https://checkout.wompi.co/l/${paymentData.data.id}`;
      } else {
        throw new Error('No se recibió el ID del enlace de pago');
      }
    } catch (error: any) {
      console.error('Error al procesar el pago:', error);
      alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}. Por favor, intenta nuevamente.`);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
        <Navbar />
        <div className="pt-32 px-4 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Agrega algunos platos antes de proceder al pago
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all"
            >
              Ver Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Pedido Confirmado!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Tu pedido ha sido procesado exitosamente. Recibirás un mensaje de
            confirmación por WhatsApp.
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Total pagado: <span className="font-bold text-primary-500">{formatPrice(total)}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirigiendo en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Finalizar Pedido
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información de Contacto */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Información de Contacto
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4" />
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="juan@email.com"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+57 300 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4" />
                      Dirección de Entrega
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Calle 123 #45-67"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Home className="w-4 h-4" />
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Sibundoy, Putumayo"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Indicaciones especiales para la entrega..."
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Método de Pago */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Método de Pago
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          selectedPayment === method.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedPayment === method.id
                              ? "bg-primary-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPayment === method.id
                              ? "border-primary-500 bg-primary-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedPayment === method.id && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resumen del Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {item.price}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envío:</span>
                    <span>{formatPrice(deliveryCost)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span>Total:</span>
                    <span className="text-primary-500">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Procesando..." : "Confirmar Pedido"}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  Al confirmar aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
