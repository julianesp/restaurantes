import { NextResponse } from "next/server";
import { adminCtx, isPlatformAdminEmail } from "@/lib/tenant";
import { all, first, batch, newId, nowIso, isUniqueViolation, type Row } from "@/lib/db";
import { isValidPin, PIN_RULE_TEXT } from "@/lib/waiter-pin";
import { hashPin } from "@/lib/waiter-session";

// Equipo del restaurante: meseros y chefs. Cada persona entra con su PROPIO correo (miembro con rol
// waiter/chef en restaurant_members) y, si es mesero, además puede tener un PIN (tabla waiters) para
// una tableta compartida. Ninguno de los dos roles administra: adminCtx() solo acepta owner/admin.

const ROLES = ["waiter", "chef"] as const;
type Role = (typeof ROLES)[number];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const norm = (email: unknown) => String(email ?? "").toLowerCase().trim();

interface Person {
  email: string;
  name: string;
  role: Role;
  active: boolean;
  /** Puede entrar con su cuenta (correo verificado) */
  account: boolean;
  /** Tiene PIN de mesero */
  pin: boolean;
  created_at: string;
}

// GET: el equipo, con el correo como identificador. El PIN no sale nunca (solo si existe o no).
export async function GET() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const [members, waiters] = await Promise.all([
    all<Row>(
      "SELECT email, role, name, active, created_at FROM restaurant_members WHERE restaurant_id = ? AND role IN ('waiter', 'chef')",
      ctx.tenant.id
    ),
    all<Row>("SELECT email, name, active, created_at FROM waiters WHERE restaurant_id = ?", ctx.tenant.id),
  ]);

  const people = new Map<string, Person>();
  for (const m of members) {
    const email = norm(m.email);
    people.set(email, {
      email, role: m.role as Role, name: String(m.name || email.split("@")[0]),
      active: !!m.active, account: true, pin: false, created_at: String(m.created_at),
    });
  }
  for (const w of waiters) {
    const email = norm(w.email);
    const person = people.get(email);
    if (person) {
      person.pin = true;
      person.active = person.active && !!w.active;
    } else {
      // Mesero creado antes de los roles: solo entra con su PIN
      people.set(email, {
        email, role: "waiter", name: String(w.name), active: !!w.active, account: false, pin: true, created_at: String(w.created_at),
      });
    }
  }
  return NextResponse.json([...people.values()].sort((a, b) => a.name.localeCompare(b.name, "es")));
}

// POST: agrega a alguien al equipo { name, email, role, pin? }
export async function POST(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = norm(body.email);
  const role = body.role as Role;
  const pin = body.pin ? String(body.pin) : "";

  if (name.length < 2 || name.length > 60) return bad("El nombre debe tener entre 2 y 60 caracteres");
  if (!EMAIL.test(email)) return bad("Escribe un correo válido");
  if (!ROLES.includes(role)) return bad("El rol debe ser mesero o chef");
  if (pin && role !== "waiter") return bad("El PIN es solo para meseros");
  if (pin && !isValidPin(pin)) return bad(PIN_RULE_TEXT);
  // La cuenta de Brasaya analiza los restaurantes: no trabaja en ninguno
  if (isPlatformAdminEmail(email)) return bad("Ese correo es de la administración de Brasaya y no puede ser parte de un equipo");

  const taken = await first<Row>("SELECT role FROM restaurant_members WHERE restaurant_id = ? AND email = ?", tenant.id, email);
  if (taken) {
    return bad(
      taken.role === "owner" || taken.role === "admin"
        ? "Ese correo es del dueño o de un administrador de este restaurante"
        : "Ese correo ya está en tu equipo",
      409
    );
  }
  const waiterRow = await first<Row>("SELECT id FROM waiters WHERE restaurant_id = ? AND email = ?", tenant.id, email);
  if (waiterRow && pin) return bad("Ese mesero ya tiene un PIN. Cámbialo desde su fila", 409);

  const now = nowIso();
  try {
    await batch([
      {
        sql: `INSERT INTO restaurant_members (id, restaurant_id, email, role, name, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`,
        params: [newId(), tenant.id, email, role, name, now],
      },
      ...(pin
        ? [{
            sql: `INSERT INTO waiters (id, restaurant_id, name, email, pin, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`,
            params: [newId(), tenant.id, name, email, await hashPin(tenant.id, pin), now],
          }]
        : []),
    ]);
  } catch (error) {
    if (isUniqueViolation(error)) return bad("El correo o el PIN ya están en uso", 409);
    throw error;
  }
  return NextResponse.json({ ok: true, email }, { status: 201 });
}

// PATCH: { email, active?, pin?, name? } — activar/desactivar, poner o cambiar el PIN, cambiar el nombre
export async function PATCH(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const { email: rawEmail, active, pin, name } = await request.json().catch(() => ({}));
  const email = norm(rawEmail);
  if (!email) return bad("El correo es requerido");
  if (pin !== undefined && !isValidPin(String(pin))) return bad(PIN_RULE_TEXT);
  if (name !== undefined && (String(name).trim().length < 2 || String(name).trim().length > 60)) {
    return bad("El nombre debe tener entre 2 y 60 caracteres");
  }

  const member = await first<Row>(
    "SELECT role, name FROM restaurant_members WHERE restaurant_id = ? AND email = ? AND role IN ('waiter', 'chef')", tenant.id, email
  );
  const waiter = await first<Row>("SELECT id FROM waiters WHERE restaurant_id = ? AND email = ?", tenant.id, email);
  if (!member && !waiter) return bad("Esa persona no está en tu equipo", 404);
  if (pin !== undefined && member?.role === "chef") return bad("El PIN es solo para meseros");

  const statements: Array<{ sql: string; params: Array<string | number> }> = [];
  if (active !== undefined) {
    const flag = active ? 1 : 0;
    statements.push({ sql: "UPDATE restaurant_members SET active = ? WHERE restaurant_id = ? AND email = ? AND role IN ('waiter', 'chef')", params: [flag, tenant.id, email] });
    statements.push({ sql: "UPDATE waiters SET active = ? WHERE restaurant_id = ? AND email = ?", params: [flag, tenant.id, email] });
  }
  if (name !== undefined) {
    const clean = String(name).trim();
    statements.push({ sql: "UPDATE restaurant_members SET name = ? WHERE restaurant_id = ? AND email = ? AND role IN ('waiter', 'chef')", params: [clean, tenant.id, email] });
    statements.push({ sql: "UPDATE waiters SET name = ? WHERE restaurant_id = ? AND email = ?", params: [clean, tenant.id, email] });
  }
  if (pin !== undefined) {
    const hashed = await hashPin(tenant.id, String(pin));
    statements.push(
      waiter
        ? { sql: "UPDATE waiters SET pin = ? WHERE restaurant_id = ? AND email = ?", params: [hashed, tenant.id, email] }
        : {
            // Mesero con cuenta que todavía no tenía PIN
            sql: "INSERT INTO waiters (id, restaurant_id, name, email, pin, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
            params: [newId(), tenant.id, String(member!.name || email.split("@")[0]), email, hashed, nowIso()],
          }
    );
  }
  if (statements.length === 0) return bad("No hay nada que cambiar");

  try {
    await batch(statements);
  } catch (error) {
    if (isUniqueViolation(error)) return bad("Ese PIN ya está en uso", 409);
    throw error;
  }
  return NextResponse.json({ ok: true });
}

// DELETE ?email=… — quita a la persona del equipo (cuenta y PIN). Nunca toca al dueño ni a administradores.
export async function DELETE(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const email = norm(new URL(request.url).searchParams.get("email"));
  if (!email) return bad("El correo es requerido");

  await batch([
    { sql: "DELETE FROM restaurant_members WHERE restaurant_id = ? AND email = ? AND role IN ('waiter', 'chef')", params: [tenant.id, email] },
    { sql: "DELETE FROM waiters WHERE restaurant_id = ? AND email = ?", params: [tenant.id, email] },
  ]);
  return NextResponse.json({ ok: true });
}
