"use client";

import { useEffect, useState } from "react";
import {
  Award,
  TrendingUp,
  Star,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { WeeklyFeaturedDish } from "@/app/api/weekly-dishes/route";

export default function PlatDeLaSemaine() {
  const [currentDish, setCurrentDish] = useState<WeeklyFeaturedDish | null>(null);
  const [history, setHistory] = useState<WeeklyFeaturedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch current featured dish and history
      const [currentResponse, historyResponse] = await Promise.all([
        fetch('/api/weekly-dishes?type=current'),
        fetch('/api/weekly-dishes?type=history&limit=10')
      ]);

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentDish(currentData.data?.[0] || null);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data || []);
      }
    } catch (error) {
      console.error('Error fetching weekly dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWinBadge = (winCount: number) => {
    if (winCount === 1) return null;

    const badges = [
      { threshold: 2, icon: Star, label: "2x Ganador", color: "from-yellow-400 to-yellow-600", glow: "shadow-yellow-500/50" },
      { threshold: 3, icon: Award, label: "3x Campeón", color: "from-orange-400 to-orange-600", glow: "shadow-orange-500/50" },
      { threshold: 5, icon: Crown, label: "5x Leyenda", color: "from-purple-400 to-purple-600", glow: "shadow-purple-500/50" },
    ];

    const badge = badges.reverse().find(b => winCount >= b.threshold) || badges[0];
    const Icon = badge.icon;

    return (
      <div className={`absolute -top-4 -right-4 bg-gradient-to-br ${badge.color} text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl ${badge.glow} flex items-center gap-2 animate-pulse-slow z-10`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white/70 mt-4 font-serif italic">Chargement...</p>
        </div>
      </section>
    );
  }

  if (!currentDish && history.length === 0) {
    return null; // No mostrar la sección si no hay datos
  }

  const nextHistory = () => {
    setSelectedHistoryIndex((prev) => (prev + 1) % history.length);
  };

  const prevHistory = () => {
    setSelectedHistoryIndex((prev) => (prev - 1 + history.length) % history.length);
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header - Elegant French Style */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-yellow-400"></div>
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-yellow-400 to-yellow-400"></div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-serif text-white mb-4 tracking-wide">
            <span className="italic font-light">Le</span>{" "}
            <span className="font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Plat de la Semaine
            </span>
          </h2>

          <p className="text-xl text-white/80 font-serif italic max-w-2xl mx-auto">
            Notre chef a sélectionné avec soin les créations les plus appréciées
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-400/50"></div>
            <Crown className="w-6 h-6 text-yellow-400" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-400/50"></div>
          </div>
        </div>

        {/* Current Featured Dish */}
        {currentDish && (
          <div className="mb-20">
            <div className="relative max-w-5xl mx-auto">
              {/* Win Badge */}
              {getWinBadge(currentDish.win_count)}

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-yellow-400/30 shadow-2xl overflow-hidden">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-yellow-400/50 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-yellow-400/50 rounded-br-3xl"></div>

                <div className="relative p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <div className="relative">
                      <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-400/20">
                        {currentDish.item_image ? (
                          <img
                            src={currentDish.item_image}
                            alt={currentDish.item_name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-purple-400/20 flex items-center justify-center">
                            <Award className="w-32 h-32 text-yellow-400/40" />
                          </div>
                        )}
                      </div>

                      {/* Floating Stats */}
                      <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-4 shadow-xl">
                        <div className="text-center">
                          <p className="text-xs text-yellow-900 font-medium">Vendido</p>
                          <p className="text-2xl font-bold text-white">{currentDish.total_quantity_sold}</p>
                          <p className="text-xs text-yellow-900">unidades</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Crown className="w-6 h-6 text-yellow-400" />
                          <span className="text-yellow-400 font-serif italic text-sm tracking-wider">
                            Cette Semaine
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                          {currentDish.item_name}
                        </h3>
                        <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                      </div>

                      {/* Description */}
                      <p className="text-lg text-white/80 font-light leading-relaxed">
                        {currentDish.item_description || "Une création exceptionnelle de notre chef"}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold text-yellow-400">
                          {formatCurrency(currentDish.item_price)}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{currentDish.total_orders}</p>
                          <p className="text-xs text-white/60 uppercase tracking-wider">Pedidos</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <Award className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{currentDish.win_count}</p>
                          <p className="text-xs text-white/60 uppercase tracking-wider">Victorias</p>
                        </div>
                      </div>

                      {/* Week Period */}
                      <div className="pt-4">
                        <p className="text-sm text-white/60 italic font-serif">
                          Semana del {formatDate(currentDish.week_start_date)} al {formatDate(currentDish.week_end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Section - Hall of Fame */}
        {history.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-2">
                <span className="italic font-light">La</span>{" "}
                <span className="font-semibold">Galerie des Champions</span>
              </h3>
              <p className="text-white/60 font-serif italic">Les créations légendaires du passé</p>
            </div>

            {/* History Carousel */}
            <div className="relative max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {history.slice(0, 3).map((dish, index) => (
                  <div
                    key={dish.id}
                    className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:-translate-y-2"
                  >
                    {/* Mini Badge */}
                    {dish.win_count > 1 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">{dish.win_count}x</span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-yellow-400/10 to-purple-400/10">
                      {dish.item_image ? (
                        <img
                          src={dish.item_image}
                          alt={dish.item_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Star className="w-16 h-16 text-yellow-400/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <h4 className="text-xl font-serif font-bold text-white mb-2 line-clamp-1">
                      {dish.item_name}
                    </h4>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {dish.item_description || "Un plato excepcional"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-lg font-bold text-yellow-400">
                        {formatCurrency(dish.item_price)}
                      </span>
                      <span className="text-xs text-white/50 font-serif italic">
                        {new Date(dish.week_start_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Link */}
              {history.length > 3 && (
                <div className="text-center mt-8">
                  <button className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-serif italic transition-colors">
                    <span>Ver toda la galería</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
