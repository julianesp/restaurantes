"use client";

import { useState } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Home,
  Bike,
  Loader2,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Soup,
  UtensilsCrossed,
  Pizza,
  Cake,
} from "lucide-react";
import {
  createPaymentLink,
  generatePaymentReference,
  formatCOP,
} from "../utils/epayco";
import Swal from "sweetalert2";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: typeof Coffee;
  color: string;
  items: MenuItem[];
}

interface CartItem extends MenuItem {
  quantity: number;
  categoryId: string;
}

// Datos del menú del día (selección de las categorías más comunes para pedidos)
const menuDelDia: MenuCategory[] = [
  {
    id: "platos-fuertes",
    name: "Platos Fuertes",
    icon: UtensilsCrossed,
    color: "text-red-700",
    items: [
      {
        id: 1,
        name: "Bandeja Paisa",
        description:
          "Frijoles, arroz, carne molida, chicharrón, chorizo, huevo, aguacate y arepa",
        price: "$28.000",
      },
      {
        id: 2,
        name: "Pechuga a la Plancha",
        description: "Pechuga de pollo con arroz y ensalada",
        price: "$22.000",
      },
      {
        id: 3,
        name: "Lomo de Cerdo",
        description: "Lomo de cerdo en salsa BBQ con papas",
        price: "$26.000",
      },
      {
        id: 4,
        name: "Pescado Frito",
        description: "Mojarra frita con arroz de coco y patacón",
        price: "$30.000",
      },
      {
        id: 5,
        name: "Cazuela de Mariscos",
        description: "Mariscos frescos en salsa criolla",
        price: "$35.000",
      },
      {
        id: 6,
        name: "Churrasco",
        description: "Carne de res con chimichurri y papas",
        price: "$32.000",
      },
    ],
  },
  {
    id: "sopas",
    name: "Sopas",
    icon: Soup,
    color: "text-orange-600",
    items: [
      {
        id: 1,
        name: "Sopa de Pollo",
        description: "Sopa casera con pollo y verduras frescas",
        price: "$12.000",
      },
      {
        id: 2,
        name: "Sancocho Campesino",
        description: "Tradicional sancocho con carne y plátano",
        price: "$15.000",
      },
      {
        id: 3,
        name: "Ajiaco Bogotano",
        description: "Sopa de papa con pollo, alcaparras y crema",
        price: "$16.000",
      },
      {
        id: 4,
        name: "Crema de Tomate",
        description: "Suave crema de tomate con albahaca",
        price: "$10.000",
        isVegetarian: true,
      },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: Coffee,
    color: "text-amber-600",
    items: [
      {
        id: 1,
        name: "Café Americano",
        description: "Café recién molido con agua caliente",
        price: "$3.000",
      },
      {
        id: 2,
        name: "Cappuccino",
        description: "Espresso con leche vaporizada y espuma",
        price: "$4.500",
      },
      {
        id: 3,
        name: "Chocolate Caliente",
        description: "Chocolate artesanal con crema batida",
        price: "$4.000",
      },
      {
        id: 4,
        name: "Jugo Natural",
        description: "Jugos de frutas frescas de temporada",
        price: "$5.000",
      },
      {
        id: 5,
        name: "Limonada de Coco",
        description: "Refrescante limonada con toque de coco",
        price: "$6.000",
      },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    icon: Cake,
    color: "text-pink-600",
    items: [
      {
        id: 1,
        name: "Tiramisú",
        description: "Clásico postre italiano con café y mascarpone",
        price: "$12.000",
      },
      {
        id: 2,
        name: "Tres Leches",
        description: "Pastel húmedo bañado en tres tipos de leche",
        price: "$10.000",
      },
      {
        id: 3,
        name: "Brownie con Helado",
        description: "Brownie de chocolate con helado de vainilla",
        price: "$11.000",
      },
      {
        id: 4,
        name: "Flan de Caramelo",
        description: "Suave flan casero con caramelo líquido",
        price: "$9.000",
      },
    ],
  },
];

const OrderModal = ({ isOpen, onClose }: OrderModalProps) => {
  const [step, setStep] = useState<"menu" | "form">("menu"); // Nuevo: paso del modal
  const [selectedCategory, setSelectedCategory] =
    useState<string>("platos-fuertes");
  const [cart, setCart] = useState<CartItem[]>([]);

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

  // Funciones para manejar el carrito
  const addToCart = (item: MenuItem, categoryId: string) => {
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.id === item.id && cartItem.categoryId === categoryId,
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id && cartItem.categoryId === categoryId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity: 1, categoryId }]);
    }
  };

  const removeFromCart = (itemId: number, categoryId: string) => {
    setCart(
      cart.filter(
        (item) => !(item.id === itemId && item.categoryId === categoryId),
      ),
    );
  };

  const updateQuantity = (
    itemId: number,
    categoryId: string,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, categoryId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId && item.categoryId === categoryId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[$.,]/g, ""));
      return total + price * item.quantity;
    }, 0);
  };

  const getCartSummary = () => {
    return cart.map((item) => `${item.quantity}x ${item.name}`).join(", ");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

    // Validar que haya items en el carrito
    if (cart.length === 0) {
      newErrors.cart = "Debes agregar al menos un plato a tu pedido";
    }

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
      const totalAmount = getCartTotal();
      const pedidoDescripcion = getCartSummary();

      // Generar referencia única
      const reference = generatePaymentReference("PEDIDO");

      // Crear descripción del pago
      const description = `Pedido - ${formData.nombre} - ${formData.tipoServicio}`;

      // URL de redirección después del pago (usa la variable de entorno o el origin actual)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/payment/success?type=pedido&reference=${reference}`;

      // Crear enlace de pago en ePayco
      const paymentData = await createPaymentLink({
        amount: totalAmount,
        currency: "COP",
        reference,
        description,
        customerEmail: "cliente@restaurante.com",
        customerName: formData.nombre,
        customerPhone: formData.telefono,
        redirectUrl,
      });

      console.log("Payment data received:", paymentData);

      if (!paymentData.success || !paymentData.paymentUrl) {
        throw new Error("No se recibió el enlace de pago de ePayco");
      }

      // Guardar datos del pedido en localStorage para después del pago
      localStorage.setItem(
        `pedido_${reference}`,
        JSON.stringify({
          ...formData,
          pedido: pedidoDescripcion,
          items: cart,
          total: totalAmount,
          reference,
          paymentId: paymentData.transactionId,
          createdAt: new Date().toISOString(),
        }),
      );

      // Redirigir al checkout de ePayco
      console.log("Redirecting to ePayco:", paymentData.paymentUrl);
      window.location.href = paymentData.paymentUrl;
    } catch (error: unknown) {
      console.error("Error al procesar el pago:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      await Swal.fire({
        icon: "error",
        title: "Error al procesar el pago",
        text: `${errorMessage}. Por favor intenta de nuevo.`,
        confirmButtonColor: "#3b82f6",
      });

      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  const currentCategory = menuDelDia.find((cat) => cat.id === selectedCategory);
  const IconComponent = currentCategory?.icon || UtensilsCrossed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-secondary-500 to-primary-500 text-white p-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">
            {step === "menu"
              ? "Selecciona tu Pedido"
              : "Completa tu Información"}
          </h2>
          <p className="text-white/90 text-sm">
            {step === "menu"
              ? "Elige los platos que deseas pedir para hoy"
              : "Datos de entrega y pago"}
          </p>
        </div>

        {/* Vista de Menú */}
        {step === "menu" && (
          <div className="p-6">
            {/* Categorías del menú */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {menuDelDia.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <CategoryIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Items del menú */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {currentCategory?.items.map((item) => {
                const cartItem = cart.find(
                  (c) => c.id === item.id && c.categoryId === selectedCategory,
                );
                const quantity = cartItem?.quantity || 0;

                return (
                  <div
                    key={`${selectedCategory}-${item.id}`}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.description}
                        </p>
                        {item.isVegetarian && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                            🌱 Vegetariano
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {item.price}
                      </span>
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item, selectedCategory)}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                selectedCategory,
                                quantity - 1,
                              )
                            }
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                selectedCategory,
                                quantity + 1,
                              )
                            }
                            className="w-8 h-8 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              removeFromCart(item.id, selectedCategory)
                            }
                            className="ml-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen del carrito */}
            {cart.length > 0 && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t-2 border-primary-500 pt-4 pb-2">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Tu Pedido ({cart.length}{" "}
                    {cart.length === 1 ? "item" : "items"})
                  </h3>
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={`cart-${item.categoryId}-${item.id}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          $
                          {(
                            parseFloat(item.price.replace(/[$.,]/g, "")) *
                            item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-primary-200 dark:border-primary-700 pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCOP(getCartTotal())}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("form")}
                    className="w-full py-3 bg-gradient-to-r from-secondary-500 to-primary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                  >
                    Continuar con el Pedido
                  </button>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div className="text-center py-12">
                <IconComponent className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Selecciona los platos que deseas ordenar
                </p>
              </div>
            )}
          </div>
        )}

        {/* Vista de Formulario */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Resumen del pedido */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Resumen de tu Pedido
              </h3>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div
                    key={`summary-${item.categoryId}-${item.id}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      $
                      {(
                        parseFloat(item.price.replace(/[$.,]/g, "")) *
                        item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary-200 dark:border-primary-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCOP(getCartTotal())}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("menu")}
                className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                ← Modificar pedido
              </button>
            </div>

            {errors.cart && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.cart}
                </p>
              </div>
            )}

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
                    setFormData((prev) => ({
                      ...prev,
                      tipoServicio: "domicilio",
                    }))
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
                    setFormData((prev) => ({
                      ...prev,
                      tipoServicio: "recoger",
                    }))
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.direccion}
                    </p>
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

            {/* Info importante */}
            <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-secondary-700 dark:text-secondary-400 mb-2">
                  Información importante:
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Pago 100% seguro a través de ePayco</li>
                  <li>Puedes pagar con PSE, tarjetas débito/crédito, efectivo</li>
                  <li>
                    Te confirmaremos tu pedido por WhatsApp después del pago
                  </li>
                  <li>El costo de domicilio puede variar según tu ubicación</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("menu")}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Volver
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
                  <>Pagar {formatCOP(getCartTotal())}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
