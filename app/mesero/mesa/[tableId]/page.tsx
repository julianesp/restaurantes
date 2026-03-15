"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Minus, Send, Star, ArrowLeft, ChefHat, X, CheckCircle } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

interface DailySpecial {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
}

export default function MeseroTablePage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.tableId as string;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dailySpecials, setDailySpecials] = useState<DailySpecial[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("especiales");
  const [notes, setNotes] = useState("");
  const [quickOptions, setQuickOptions] = useState<string[]>([]);

  const QUICK_OPTIONS = ["Sin arroz", "Con aromática", "Solo bandeja", "Con sopa"];

  const toggleOption = (opt: string) => {
    setQuickOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [menuRes, specialsRes] = await Promise.all([
          fetch("/api/menu/full"),
          fetch("/api/daily-specials"),
        ]);

        if (menuRes.ok) {
          const categories = await menuRes.json();
          const allItems: MenuItem[] = [];
          categories.forEach((cat: any) => {
            cat.items?.forEach((item: any) => {
              allItems.push({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: cat.name,
              });
            });
          });
          setMenuItems(allItems);
        }

        if (specialsRes.ok) {
          const specials: DailySpecial[] = await specialsRes.json();
          const available = specials.filter((s) => s.available);
          setDailySpecials(available);
          // Si no hay especiales, abrir en "Todos"
          if (available.length === 0) setSelectedCategory("all");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const addItem = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const totalItems = orderItems.reduce((s, i) => s + i.quantity, 0);

  const sendToKitchen = async () => {
    if (orderItems.length === 0) return;
    setSending(true);
    try {
      const total = orderItems.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[$.,]/g, "")) || 0;
        return sum + price * item.quantity;
      }, 0);

      const res = await fetch("/api/orders/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          items: orderItems,
          total,
          timestamp: new Date().toISOString(),
          customerNotes: [
            ...quickOptions,
            ...(!quickOptions.includes("Con sopa") ? ["Sin sopa"] : []),
            ...(notes.trim() ? [notes.trim()] : []),
          ].join(" · ") || null,
        }),
      });

      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setOrderItems([]);
          setNotes("");
          setQuickOptions([]);
          setSent(false);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
      alert("Error al enviar el pedido.");
    } finally {
      setSending(false);
    }
  };

  const menuCategories = [...new Set(menuItems.map((i) => i.category))];
  const categories = [
    ...(dailySpecials.length > 0 ? ["especiales"] : []),
    "all",
    ...menuCategories,
  ];

  const visibleItems: MenuItem[] =
    selectedCategory === "especiales"
      ? dailySpecials
      : selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  const getQty = (id: string) => orderItems.find((i) => i.id === id)?.quantity ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-3" />
          <p className="text-gray-500">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pedido enviado a cocina!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Mesa {tableId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/mesero")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                Mesa {tableId}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tomar pedido</p>
            </div>
          </div>
          {totalItems > 0 && (
            <span className="bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {totalItems} ítem{totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Categorías */}
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 overflow-x-auto flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? cat === "especiales"
                    ? "bg-orange-500 text-white"
                    : "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {cat === "especiales" && <Star className="w-3 h-3" />}
              {cat === "especiales" ? "Especiales" : cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de platos */}
      <div className="max-w-4xl mx-auto w-full px-4 py-4 flex-1">
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const qty = getQty(item.id);
            const isSpecial = selectedCategory === "especiales";
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-xl flex items-center gap-3 shadow-sm border overflow-hidden ${
                  isSpecial
                    ? "border-orange-300 dark:border-orange-600"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                {/* Imagen */}
                {(item as any).image ? (
                  <img
                    src={(item as any).image}
                    alt={item.name}
                    className="w-20 h-20 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-20 h-20 flex-shrink-0 flex items-center justify-center text-2xl ${
                    isSpecial ? "bg-orange-50 dark:bg-orange-900/20" : "bg-gray-50 dark:bg-gray-700"
                  }`}>
                    🍽️
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 py-3 pr-1">
                  <div className="flex items-center gap-2">
                    {isSpecial && <Star className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <p className={`text-sm font-bold mt-1 ${isSpecial ? "text-orange-500" : "text-primary-500"}`}>
                    {item.price}
                  </p>
                </div>

                {/* Controles cantidad */}
                <div className="pr-3 flex-shrink-0">
                {qty === 0 ? (
                  <button
                    onClick={() => addItem(item)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all ${
                      isSpecial ? "bg-orange-500 hover:bg-orange-600" : "bg-primary-500 hover:bg-primary-600"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Añadir
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                      {qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors ${
                        isSpecial ? "bg-orange-500 hover:bg-orange-600" : "bg-primary-500 hover:bg-primary-600"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel inferior — resumen y enviar */}
      {orderItems.length > 0 && (
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {/* Resumen de items */}
            <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold px-1.5 py-0.5 rounded">
                      ×{item.quantity}
                    </span>
                    {item.name}
                  </span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Opciones rápidas */}
            <div className="flex gap-2 flex-wrap mb-2">
              {QUICK_OPTIONS.map((opt) => {
                const active = quickOptions.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      active
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-white border-white" : "border-gray-400 dark:border-gray-400"
                    }`}>
                      {active && <span className="block w-2 h-2 bg-primary-500 rounded-sm" />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Nota opcional */}
            <input
              type="text"
              placeholder="Otra nota para cocina (ej: sin cebolla, alergia...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white mb-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />

            {/* Botón enviar */}
            <button
              onClick={sendToKitchen}
              disabled={sending}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-base"
            >
              <ChefHat className="w-5 h-5" />
              {sending ? "Enviando..." : `Enviar a cocina — ${totalItems} ítem${totalItems !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
