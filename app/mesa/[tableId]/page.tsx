"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Send, QrCode } from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

export default function TableOrderPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Cargar menú
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch("/api/menu/full");
      if (response.ok) {
        const categories = await response.json();
        const allItems: MenuItem[] = [];
        categories.forEach((cat: any) => {
          cat.items?.forEach((item: any) => {
            allItems.push({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: cat.name,
              image: item.image,
            });
          });
        });
        setMenuItems(allItems);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromOrder(itemId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[$.,]/g, ""));
      return total + price * item.quantity;
    }, 0);
  };

  const sendOrder = async () => {
    if (orderItems.length === 0) return;

    try {
      const response = await fetch("/api/orders/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          items: orderItems,
          total: calculateTotal(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setOrderSent(true);
        setTimeout(() => {
          setOrderItems([]);
          setOrderSent(false);
          setShowCart(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending order:", error);
      alert("Error al enviar el pedido. Por favor intente nuevamente.");
    }
  };

  const categories = ["all", ...new Set(menuItems.map((i) => i.category))];
  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mesa {tableId}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restaurante Munay
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
              {orderItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              {item.image && (
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-500">
                    {item.price}
                  </span>
                  <button
                    onClick={() => addToOrder(item)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl md:rounded-2xl max-h-[90vh] flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tu Pedido - Mesa {tableId}
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {orderItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No has agregado ningún plato
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {orderItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-primary-500">
                    ${calculateTotal().toLocaleString("es-CO")}
                  </span>
                </div>
                {orderSent ? (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg text-center font-bold">
                    ✓ ¡Pedido enviado a cocina!
                  </div>
                ) : (
                  <button
                    onClick={sendOrder}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    Enviar Pedido a Cocina
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
