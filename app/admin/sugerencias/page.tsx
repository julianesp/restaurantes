'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Suggestion {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  rating: number | null;
  suggestion_type: string;
  is_read: boolean;
  is_replied: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const suggestionTypeLabels: Record<string, string> = {
  general: 'General',
  food: 'Comida',
  service: 'Servicio',
  atmosphere: 'Ambiente',
  complaint: 'Queja',
  compliment: 'Felicitación',
};

const suggestionTypeColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-800',
  food: 'bg-orange-100 text-orange-800',
  service: 'bg-blue-100 text-blue-800',
  atmosphere: 'bg-green-100 text-green-800',
  complaint: 'bg-red-100 text-red-800',
  compliment: 'bg-purple-100 text-purple-800',
};

export default function SugerenciasAdmin() {
  const { isLoaded, userId } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  useEffect(() => {
    if (isLoaded && userId) {
      fetchSuggestions();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    applyFilters();
  }, [suggestions, filterType, filterRead]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suggestions');
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar sugerencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...suggestions];

    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.suggestion_type === filterType);
    }

    if (filterRead === 'read') {
      filtered = filtered.filter((s) => s.is_read);
    } else if (filterRead === 'unread') {
      filtered = filtered.filter((s) => !s.is_read);
    }

    setFilteredSuggestions(filtered);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_read: true } : s))
        );
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const updateAdminNotes = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      });

      if (response.ok) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, admin_notes: adminNotes } : s))
        );
        alert('Notas guardadas correctamente');
      }
    } catch (error) {
      console.error('Error al guardar notas:', error);
    }
  };

  const deleteSuggestion = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sugerencia?')) return;

    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
        setSelectedSuggestion(null);
      }
    } catch (error) {
      console.error('Error al eliminar sugerencia:', error);
    }
  };

  const openDetail = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || '');
    if (!suggestion.is_read) {
      markAsRead(suggestion.id);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!userId) {
    return <div className="p-8">Debes iniciar sesión para ver esta página.</div>;
  }

  const unreadCount = suggestions.filter((s) => !s.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Buzón de Sugerencias</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los comentarios y sugerencias de tus clientes
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{suggestions.length}</div>
              <div className="text-sm text-gray-600">Total de sugerencias</div>
              {unreadCount > 0 && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {unreadCount} sin leer
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {Object.entries(suggestionTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="unread">Sin leer</option>
                <option value="read">Leídas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de sugerencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Cargando sugerencias...</div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay sugerencias para mostrar
              </div>
            ) : (
              filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => openDetail(suggestion)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    !suggestion.is_read ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            suggestionTypeColors[suggestion.suggestion_type]
                          }`}
                        >
                          {suggestionTypeLabels[suggestion.suggestion_type]}
                        </span>
                        {!suggestion.is_read && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Nueva
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-gray-800">
                        {suggestion.name || 'Anónimo'}
                      </div>
                      {suggestion.rating && (
                        <div className="text-yellow-500 text-sm">
                          {'★'.repeat(suggestion.rating)}
                          {'☆'.repeat(5 - suggestion.rating)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(suggestion.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {suggestion.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Detalle de sugerencia */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedSuggestion ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Detalle</h2>
                  <button
                    onClick={() => setSelectedSuggestion(null)}
                    className="text-gray-500 hover:text-gray-700"
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

                <div className="space-y-4">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        suggestionTypeColors[selectedSuggestion.suggestion_type]
                      }`}
                    >
                      {suggestionTypeLabels[selectedSuggestion.suggestion_type]}
                    </span>
                  </div>

                  {selectedSuggestion.rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calificación
                      </label>
                      <div className="text-yellow-500 text-2xl">
                        {'★'.repeat(selectedSuggestion.rating)}
                        {'☆'.repeat(5 - selectedSuggestion.rating)}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <div className="text-gray-900">
                      {selectedSuggestion.name || 'Anónimo'}
                    </div>
                    {selectedSuggestion.email && (
                      <div className="text-sm text-gray-600">
                        {selectedSuggestion.email}
                      </div>
                    )}
                    {selectedSuggestion.phone && (
                      <div className="text-sm text-gray-600">
                        {selectedSuggestion.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                      {selectedSuggestion.message}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <div className="text-gray-600 text-sm">
                      {new Date(selectedSuggestion.created_at).toLocaleString('es-ES')}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="admin_notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Notas internas
                    </label>
                    <textarea
                      id="admin_notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Agrega notas internas sobre esta sugerencia..."
                    />
                    <button
                      onClick={() => updateAdminNotes(selectedSuggestion.id)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar Notas
                    </button>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => deleteSuggestion(selectedSuggestion.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar Sugerencia
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Selecciona una sugerencia para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
