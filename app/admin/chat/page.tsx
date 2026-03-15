"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, ChefHat, UtensilsCrossed, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  sender_role: "waiter" | "chef";
  sender_name: string;
  message: string;
  order_ref: string | null;
  created_at: string;
}

export default function KitchenChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [role, setRole] = useState<"waiter" | "chef">("waiter");
  const [senderName, setSenderName] = useState("");
  const [text, setText] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (initial = false) => {
    try {
      const url = initial || !lastTimestamp
        ? "/api/kitchen-chat?limit=100"
        : `/api/kitchen-chat?since=${encodeURIComponent(lastTimestamp)}&limit=50`;

      const res = await fetch(url);
      if (!res.ok) return;
      const data: ChatMessage[] = await res.json();

      if (data.length > 0) {
        if (initial) {
          setMessages(data);
        } else {
          setMessages((prev) => [...prev, ...data]);
        }
        setLastTimestamp(data[data.length - 1].created_at);
      }
    } catch (e) {
      console.error("Error cargando mensajes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => loadMessages(false), 5000);
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !senderName.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/kitchen-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_role: role,
          sender_name: senderName.trim(),
          message: text.trim(),
          order_ref: orderRef.trim() || null,
        }),
      });

      if (res.ok) {
        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setLastTimestamp(newMsg.created_at);
        setText("");
        setOrderRef("");
      }
    } catch (e) {
      console.error("Error enviando mensaje:", e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const roleConfig = {
    waiter: {
      label: "Mesero",
      icon: UtensilsCrossed,
      bubbleSelf: "bg-primary-500 text-white",
      bubbleOther: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white",
      badge: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    },
    chef: {
      label: "Chef",
      icon: ChefHat,
      bubbleSelf: "bg-orange-500 text-white",
      bubbleOther: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chat Cocina
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comunicación entre mesero y chef
              </p>
            </div>
          </div>
          <button
            onClick={() => loadMessages(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Actualizar mensajes"
          >
            <RefreshCw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Selector de rol y nombre */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ¿Quién eres?
          </p>
          <div className="flex gap-3 mb-3">
            {(["waiter", "chef"] as const).map((r) => {
              const cfg = roleConfig[r];
              const Icon = cfg.icon;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 transition-all ${
                    role === r
                      ? r === "waiter"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder={`Tu nombre (${roleConfig[role].label})`}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        {/* Mensajes */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col min-h-[420px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[480px]">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Cargando mensajes...</p>
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Sin mensajes aún. ¡Inicia la conversación!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.sender_role === role && msg.sender_name === senderName;
              const cfg = roleConfig[msg.sender_role];
              const Icon = cfg.icon;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
                >
                  {!isMine && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.badge}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!isMine && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {msg.sender_name} · {cfg.label}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? `${roleConfig[role].bubbleSelf} rounded-tr-sm`
                          : `${cfg.bubbleOther} rounded-tl-sm`
                      }`}
                    >
                      {msg.order_ref && (
                        <p className="text-xs opacity-75 mb-1 font-mono">
                          Pedido: {msg.order_ref}
                        </p>
                      )}
                      <p>{msg.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Referencia de pedido (opcional, ej: ORDER-123)"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    !senderName.trim()
                      ? "Primero ingresa tu nombre arriba..."
                      : "Escribe un mensaje..."
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!senderName.trim()}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (text.trim() && senderName.trim()) handleSend(e as any);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim() || !senderName.trim()}
                  className={`px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    role === "waiter"
                      ? "bg-primary-500 hover:bg-primary-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {sending ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Los mensajes se actualizan automáticamente cada 5 segundos
        </p>
      </div>
    </div>
  );
}
