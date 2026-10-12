import { NextResponse } from "next/server";
import { publicCtx } from "@/lib/tenant";
import { all, first, batch, newId, nowIso, type Row } from "@/lib/db";

const STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];

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

export async function POST(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { tableId, items, total, customerNotes } = await request.json();

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // El sufijo aleatorio evita choques entre restaurantes (order_number es único global)
    const suffix = Math.random().toString(36).slice(2, 5);
    const orderNumber = `ORDER-${Date.now()}-${tableId}-${suffix}`;
    const orderId = newId();
    const now = nowIso();

    // Pedido + items en una sola transacción: no puede quedar un pedido sin items
    await batch([
      {
        sql: `INSERT INTO table_orders (id, restaurant_id, order_number, table_id, total, status, customer_notes, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        params: [orderId, tenant.id, orderNumber, String(tableId), parseFloat(total), customerNotes || null, now, now],
      },
      ...items.map((item: Row) => {
        const price = parseInt(String(item.price).replace(/[$.,]/g, ""), 10) || 0;
        return {
          sql: `INSERT INTO table_order_items (id, restaurant_id, order_id, item_id, item_name, item_description, item_price, quantity, subtotal, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            newId(), tenant.id, orderId, String(item.id), String(item.name),
            String(item.description || ""), String(item.price), Number(item.quantity) || 1,
            price * (Number(item.quantity) || 1), now,
          ],
        };
      }),
    ]);

    const order = await first<Row>("SELECT * FROM table_orders WHERE id = ? AND restaurant_id = ?", orderId, tenant.id);
    const [fullOrder] = await withItems(tenant.id, order ? [order] : []);

    return NextResponse.json({ success: true, order: fullOrder }, { status: 200 });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json({ error: "Error al procesar el pedido" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    // Pedido específico por ID
    if (orderId) {
      const order = await first<Row>(
        "SELECT * FROM table_orders WHERE id = ? AND restaurant_id = ?",
        orderId,
        tenant.id
      );
      if (!order) return NextResponse.json({ error: "Error al obtener el pedido" }, { status: 404 });
      const [full] = await withItems(tenant.id, [order]);
      return NextResponse.json(full);
    }

    const params: string[] = [tenant.id];
    let sql = "SELECT * FROM table_orders WHERE restaurant_id = ?";
    if (tableId) { sql += " AND table_id = ?"; params.push(tableId); }
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY created_at DESC";

    return NextResponse.json(await withItems(tenant.id, await all<Row>(sql, ...params)));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

// PATCH para actualizar el estado de un pedido
export async function PATCH(request: Request) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;
    const { tenant } = ctx;

    const { orderId, status, customerNotes } = await request.json();

    if (!orderId) return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 });
    if (status && !STATUSES.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    const sets: string[] = ["updated_at = ?"];
    const params: Array<string | null> = [nowIso()];
    if (status) { sets.push("status = ?"); params.push(status); }
    if (customerNotes !== undefined) { sets.push("customer_notes = ?"); params.push(customerNotes); }

    const order = await first<Row>(
      `UPDATE table_orders SET ${sets.join(", ")} WHERE id = ? AND restaurant_id = ? RETURNING *`,
      ...params, orderId, tenant.id
    );
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    const [full] = await withItems(tenant.id, [order]);
    return NextResponse.json({ success: true, order: full });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 });
  }
}
