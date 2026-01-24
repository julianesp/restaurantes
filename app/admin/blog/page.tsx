"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Newspaper,
  Home,
  Eye,
  EyeOff,
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: "platos-especiales" | "noticias" | "recetas" | "eventos";
  tags: string[];
  published: boolean;
  createdAt: string;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Plato Especial de Enero: Cazuela de Mariscos del Pacífico",
      excerpt:
        "Este mes presentamos nuestra exquisita cazuela de mariscos frescos del Pacífico colombiano.",
      content: "Contenido completo del artículo...",
      category: "platos-especiales",
      tags: ["Plato del Mes", "Mariscos"],
      published: true,
      createdAt: "2026-01-15",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "noticias" as BlogPost["category"],
    tags: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    if (editingId) {
      setPosts(
        posts.map((post) =>
          post.id === editingId
            ? {
                ...post,
                title: formData.title,
                excerpt: formData.excerpt,
                content: formData.content,
                category: formData.category,
                tags: tagsArray,
              }
            : post
        )
      );
    } else {
      const newPost: BlogPost = {
        id: Date.now(),
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
        published: false,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPosts([newPost, ...posts]);
    }

    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "noticias",
      tags: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(", "),
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta publicación?")) {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  const togglePublished = (id: number) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, published: !post.published } : post
      )
    );
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "noticias",
      tags: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      "platos-especiales": "Plato Especial",
      noticias: "Noticia",
      recetas: "Receta",
      eventos: "Evento",
    };
    return labels[category as keyof typeof labels];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "platos-especiales":
        "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
      noticias:
        "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
      recetas:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      eventos:
        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    };
    return colors[category as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Blog & Noticias
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gestiona las publicaciones del blog
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                target="_blank"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">Ver Blog</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Publicación
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? "Editar Publicación" : "Nueva Publicación"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Título de la publicación"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="platos-especiales">Plato Especial</option>
                    <option value="noticias">Noticia</option>
                    <option value="recetas">Receta</option>
                    <option value="eventos">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Nuevo, Promoción, Evento"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resumen (Excerpt)
                </label>
                <textarea
                  name="excerpt"
                  required
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Breve descripción que aparecerá en la tarjeta..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido Completo
                </label>
                <textarea
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Contenido completo de la publicación..."
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Guardar Cambios" : "Crear Publicación"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all ${
                post.published
                  ? "border-green-500 dark:border-green-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        post.published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {post.published ? "Publicado" : "Borrador"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {getCategoryLabel(post.category)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Creado: {post.createdAt}
                </p>
                <button
                  onClick={() => togglePublished(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    post.published
                      ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {post.published ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay publicaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Crea tu primera publicación para el blog
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
