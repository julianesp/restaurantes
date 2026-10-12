import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { first, batch, newId, nowIso, isUniqueViolation } from "@/lib/db";
import { RESERVED_SLUGS, SLUG_REGEX, tenantUrl } from "@/lib/tenant-host";

const TRIAL_DAYS = 14;

// Categorías iniciales para que el menú no empiece vacío
const DEFAULT_CATEGORIES = [
  { name: "Entradas", slug: "entradas", icon: "Soup", color: "text-primary-600" },
  { name: "Platos fuertes", slug: "platos-fuertes", icon: "UtensilsCrossed", color: "text-primary-600" },
  { name: "Bebidas", slug: "bebidas", icon: "Coffee", color: "text-primary-600" },
  { name: "Postres", slug: "postres", icon: "IceCream", color: "text-primary-600" },
];

// POST /api/platform/restaurants — crea un restaurante nuevo (requiere sesión)
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const email = user.emailAddresses
    .find((e) => e.verification?.status === "verified")
    ?.emailAddress.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Necesitas un correo verificado para crear un restaurante" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const slug = String(body.slug || "").toLowerCase().trim();
  const phone = String(body.phone || "").trim().slice(0, 30);
  const city = String(body.city || "").trim().slice(0, 60);

  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: "El nombre debe tener entre 2 y 60 caracteres" }, { status: 400 });
  }
  if (!SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Subdominio no válido" }, { status: 400 });
  }

  // Un correo solo puede ser dueño de un restaurante en la prueba gratuita
  const owned = await first<{ slug: string }>(
    `SELECT r.slug FROM restaurant_members m JOIN restaurants r ON r.id = m.restaurant_id
     WHERE m.email = ? AND m.role = 'owner' LIMIT 1`,
    email
  );
  if (owned) {
    return NextResponse.json(
      { error: "Ya tienes un restaurante registrado", slug: owned.slug, url: tenantUrl(owned.slug, "/admin") },
      { status: 409 }
    );
  }

  const restaurantId = newId();
  const now = nowIso();
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const settings: Record<string, string> = {};
  if (phone) settings.phone = phone;
  if (city) settings.city = city;

  try {
    // Restaurante + dueño + categorías iniciales en una sola transacción:
    // no puede quedar un restaurante huérfano ni a medias.
    await batch([
      {
        sql: `INSERT INTO restaurants (id, slug, name, status, plan, trial_ends_at, owner_email, settings, created_at, updated_at)
              VALUES (?, ?, ?, 'trial', 'trial', ?, ?, ?, ?, ?)`,
        params: [restaurantId, slug, name, trialEndsAt, email, JSON.stringify(settings), now, now],
      },
      {
        sql: "INSERT INTO restaurant_members (id, restaurant_id, email, role, created_at) VALUES (?, ?, ?, 'owner', ?)",
        params: [newId(), restaurantId, email, now],
      },
      ...DEFAULT_CATEGORIES.map((c, i) => ({
        sql: `INSERT INTO menu_categories (id, restaurant_id, name, slug, icon, color, display_order, is_active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        params: [newId(), restaurantId, c.name, c.slug, c.icon, c.color, i + 1, now, now],
      })),
    ]);
  } catch (error) {
    // Otro usuario tomó el subdominio justo antes
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "Ese subdominio ya está en uso" }, { status: 409 });
    }
    console.error("[platform] Error creando restaurante:", error);
    return NextResponse.json({ error: "No se pudo crear el restaurante" }, { status: 500 });
  }

  return NextResponse.json(
    { slug, url: tenantUrl(slug, "/admin"), trial_ends_at: trialEndsAt },
    { status: 201 }
  );
}
