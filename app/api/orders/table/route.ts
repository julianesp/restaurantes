import { NextResponse } from "next/server";
import { publicCtx } from "@/lib/tenant";
import { all, first, batch, newId, nowIso, type Row } from "@/lib/db";
import { optionalWaiter, staffCtx } from "@/lib/waiter-session";

const STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];
const ACTIVE = ["pending", "preparing", "ready"];
const MAX_ITEMS = 60;
const MAX_QUANTITY = 99;

/** Adjunta los items a una lista de pedidos (misma forma que devolvía la API anterior). */
async function withItems(restaurantId: string, orders: Row[]): Promise<Row[]> {
  if (orders.length === 0) return [];
  const ids = orders.map((o) => o.id as string);
  const items = await all<Row>(
    `SELECT * FROM table_order_items WHERE restaurant_id = ? AND order_id IN (${ids.map(() => "?").join(", ")})`,
    restaurantId,
    ...ids
  );
  return orders.map((order) => ({ ...order, items: items.filter((i) => i.order_id === order.id) }));
}

/** "$12.000" → 12000 (0 si no es un precio). */
const parsePrice = (value: unknown) => parseInt(String(value ?? "").replace(/[$.,\s]/g, ""), 10) || 0;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

// POST: pedido de mesa. Es público (el cliente lo hace desde el QR de la mesa) y también lo envía el
// mesero. El servidor NO se fía del navegador: nombre y precio salen del menú del restaurante y el
// total se recalcula. Si lo envía un mesero (token de PIN o su cuenta), el pedido queda a su nombre.
export async function POST(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { waiter, expired } = await optionalWaiter(request, tenant);
    if (expired) return bad("Sesión de mesero vencida. Ingresa tu PIN de nuevo.", 401);

    const { tableId, items, customerNotes } = await request.json();

    if (!/^[A-Za-z0-9-]{1,20}$/.test(String(tableId ?? "")) || !Array.isArray(items) || items.length === 0) {
      return bad("Datos incompletos");
    }
    if (items.length > MAX_ITEMS) return bad("Demasiados platos en un solo pedido");

    // Platos del restaurante (menú + platos del día) a los que se refiere el pedido
    const wanted = [...new Set(items.map((i: Row) => String(i?.id ?? "")))];
    const marks = wanted.map(() => "?").join(", ");
    const [menu, specials] = await Promise.all([
      all<Row>(
        `SELECT id, name, description, price FROM menu_items WHERE restaurant_id = ? AND is_available = 1 AND id IN (${marks})`,
        tenant.id, ...wanted
      ),
      all<Row>(
        `SELECT id, name, description, price FROM daily_specials WHERE restaurant_id = ? AND available = 1 AND id IN (${marks})`,
        tenant.id, ...wanted
      ),
    ]);
    const dishes = new Map<string, Row>([...specials, ...menu].map((d) => [String(d.id), d]));

    const lines: Array<{ dish: Row; quantity: number; price: number }> = [];
    for (const item of items as Row[]) {
      const dish = dishes.get(String(item?.id ?? ""));
      const price = dish ? parsePrice(dish.price) : 0;
      if (!dish || price <= 0) return bad(`El plato "${String(item?.name ?? "").slice(0, 60)}" ya no está disponible`);
      const quantity = Math.floor(Number(item.quantity));
      if (!(quantity >= 1 && quantity <= MAX_QUANTITY)) return bad("Cantidad no válida");
      lines.push({ dish, quantity, price });
    }
    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    // El sufijo aleatorio evita choques entre restaurantes (order_number es único global)
    const suffix = Math.random().toString(36).slice(2, 5);
    const orderNumber = `ORDER-${Date.now()}-${tableId}-${suffix}`;
    const orderId = newId();
    const now = nowIso();
    const notes = typeof customerNotes === "string" && customerNotes.trim() ? customerNotes.trim().slice(0, 500) : null;

    // Pedido + items en una sola transacción: no puede quedar un pedido sin items
    await batch([
      {
        sql: `INSERT INTO table_orders (id, restaurant_id, order_number, table_id, total, status, customer_notes, waiter_name, waiter_email, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
        params: [orderId, tenant.id, orderNumber, String(tableId), total, notes, waiter?.name ?? null, waiter?.email.toLowerCase() ?? null, now, now],
      },
      ...lines.map(({ dish, quantity, price }) => ({
        sql: `INSERT INTO table_order_items (id, restaurant_id, order_id, item_id, item_name, item_description, item_price, quantity, subtotal, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          newId(), tenant.id, orderId, String(dish.id), String(dish.name),
          String(dish.description || ""), String(dish.price), quantity, price * quantity, now,
        ],
      })),
    ]);

    const order = await first<Row>("SELECT * FROM table_orders WHERE id = ? AND restaurant_id = ?", orderId, tenant.id);
    const [fullOrder] = await withItems(tenant.id, order ? [order] : []);

    return NextResponse.json({ success: true, order: fullOrder }, { status: 200 });
  } catch (error) {
    console.error("Error processing order:", error);
    return bad("Error al procesar el pedido", 500);
  }
}

// GET: pedidos del restaurante. El panel (admin) y la cocina (chef) ven todos; un mesero, solo los
// que tomó él (contienen notas de los clientes). ?active=1 devuelve solo los que siguen en curso.
export async function GET(request: Request) {
  try {
    const ctx = await staffCtx(request);
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const onlyActive = searchParams.get("active") === "1";

    const params: string[] = [tenant.id];
    let where = "restaurant_id = ?";
    if (ctx.kind === "waiter") { where += " AND waiter_email = ?"; params.push(ctx.waiter.email.toLowerCase()); }

    // Pedido específico por ID
    if (orderId) {
      const order = await first<Row>(`SELECT * FROM table_orders WHERE id = ? AND ${where}`, orderId, ...params);
      if (!order) return bad("Error al obtener el pedido", 404);
      const [full] = await withItems(tenant.id, [order]);
      return NextResponse.json(full);
    }

    let sql = `SELECT * FROM table_orders WHERE ${where}`;
    if (tableId) { sql += " AND table_id = ?"; params.push(tableId); }
    if (status) { sql += " AND status = ?"; params.push(status); }
    if (onlyActive) sql += ` AND status IN (${ACTIVE.map((s) => `'${s}'`).join(", ")})`;
    sql += " ORDER BY created_at DESC LIMIT 500";

    return NextResponse.json(await withItems(tenant.id, await all<Row>(sql, ...params)));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return bad("Error al obtener pedidos", 500);
  }
}

// PATCH: estado de un pedido. Admin: todo (y las notas). Chef: cualquier estado. Mesero: solo marcar
// como entregado un pedido SUYO que la cocina ya dejó listo.
export async function PATCH(request: Request) {
  try {
    const ctx = await staffCtx(request);
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { orderId, status, customerNotes } = await request.json();

    if (!orderId) return bad("ID de pedido requerido");
    if (status && !STATUSES.includes(status)) return bad("Estado no válido");

    let guard = "";
    const guardParams: string[] = [];
    if (ctx.kind === "waiter") {
      if (status !== "delivered" || customerNotes !== undefined) return bad("Un mesero solo puede marcar sus pedidos como entregados", 403);
      guard = " AND waiter_email = ? AND status = 'ready'";
      guardParams.push(ctx.waiter.email.toLowerCase());
    } else if (ctx.kind === "chef" && customerNotes !== undefined) {
      return bad("La cocina no puede editar las notas del pedido", 403);
    }

    const sets: string[] = ["updated_at = ?"];
    const params: Array<string | null> = [nowIso()];
    if (status) { sets.push("status = ?"); params.push(status); }
    if (customerNotes !== undefined) { sets.push("customer_notes = ?"); params.push(customerNotes); }

    const order = await first<Row>(
      `UPDATE table_orders SET ${sets.join(", ")} WHERE id = ? AND restaurant_id = ?${guard} RETURNING *`,
      ...params, orderId, tenant.id, ...guardParams
    );
    if (!order) {
      return bad(ctx.kind === "waiter" ? "Solo puedes entregar tus pedidos que ya estén listos" : "Pedido no encontrado", 404);
    }

    const [full] = await withItems(tenant.id, [order]);
    return NextResponse.json({ success: true, order: full });
  } catch (error) {
    console.error("Error updating order:", error);
    return bad("Error al actualizar el pedido", 500);
  }
}
