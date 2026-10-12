import { all, first, type Row } from "@/lib/db";

// Estadísticas de ventas por restaurante (sustituyen a las funciones SQL de Postgres).
// Zona horaria fija de Colombia (UTC-5, sin horario de verano).
const TZ_OFFSET_HOURS = -5;
const LOCAL = (col: string) => `datetime(${col}, '${TZ_OFFSET_HOURS} hours')`;

export type TimeFilter = "today" | "week" | "month" | "all";

/** Inicio del período en UTC (ISO). Semana desde el lunes, como date_trunc('week'). */
export function periodStart(filter: TimeFilter, now = new Date()): string {
  if (filter === "all") return "1900-01-01T00:00:00.000Z";
  // "ahora" en hora local de Colombia, expresado con los campos UTC del Date desplazado
  const local = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600_000);
  let y = local.getUTCFullYear();
  let m = local.getUTCMonth();
  let d = local.getUTCDate();
  if (filter === "month") d = 1;
  if (filter === "week") d -= (local.getUTCDay() + 6) % 7;
  const startLocalUtc = Date.UTC(y, m, d);
  return new Date(startLocalUtc - TZ_OFFSET_HOURS * 3600_000).toISOString();
}

const PRICE_AS_NUMBER = `CAST(REPLACE(REPLACE(REPLACE(toi.item_price, '$', ''), '.', ''), ',', '') AS REAL)`;

export async function itemStatistics(restaurantId: string, filter: TimeFilter): Promise<Row[]> {
  return all(
    `SELECT toi.item_id, toi.item_name, toi.item_description,
            ${PRICE_AS_NUMBER} AS item_price,
            COUNT(toi.id) AS order_count,
            SUM(toi.quantity) AS total_quantity_sold,
            SUM(toi.subtotal) AS total_revenue,
            MIN(o.created_at) AS first_ordered_at,
            MAX(o.created_at) AS last_ordered_at,
            ROUND(AVG(toi.quantity), 2) AS avg_quantity_per_order
     FROM table_order_items toi
     JOIN table_orders o ON o.id = toi.order_id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?
     GROUP BY toi.item_id, toi.item_name, toi.item_description, toi.item_price
     ORDER BY total_quantity_sold DESC`,
    restaurantId,
    periodStart(filter)
  );
}

export async function topItems(restaurantId: string, filter: TimeFilter, limit: number): Promise<Row[]> {
  const rows = await itemStatistics(restaurantId, filter);
  return rows.slice(0, limit).map((row, i) => ({
    item_id: row.item_id,
    item_name: row.item_name,
    item_description: row.item_description,
    item_price: row.item_price,
    order_count: row.order_count,
    total_quantity_sold: row.total_quantity_sold,
    total_revenue: row.total_revenue,
    rank_position: i + 1,
  }));
}

export async function salesSummary(restaurantId: string, filter: TimeFilter): Promise<Row[]> {
  const totals = await first<{ total_orders: number; total_items_sold: number; total_revenue: number }>(
    `SELECT COUNT(DISTINCT toi.order_id) AS total_orders,
            COALESCE(SUM(toi.quantity), 0) AS total_items_sold,
            COALESCE(SUM(toi.subtotal), 0) AS total_revenue
     FROM table_order_items toi
     JOIN table_orders o ON o.id = toi.order_id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?`,
    restaurantId,
    periodStart(filter)
  );
  const items = await itemStatistics(restaurantId, filter);
  const top = items[0];
  const orders = totals?.total_orders ?? 0;
  const revenue = totals?.total_revenue ?? 0;

  return [{
    total_orders: orders,
    total_items_sold: totals?.total_items_sold ?? 0,
    total_revenue: revenue,
    unique_items_count: items.length,
    avg_order_value: orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0,
    most_popular_item: top ? top.item_name : "N/A",
    most_popular_item_quantity: top ? top.total_quantity_sold : 0,
  }];
}

/** Plato más vendido entre dos instantes (por defecto, la semana en curso). */
export async function weekWinner(restaurantId: string, from?: string, to?: string): Promise<Row[]> {
  const start = from ?? periodStart("week");
  const startDate = new Date(start);
  const end = to ?? new Date(startDate.getTime() + 7 * 24 * 3600_000).toISOString();
  const localDate = (iso: string) => new Date(new Date(iso).getTime() + TZ_OFFSET_HOURS * 3600_000).toISOString().slice(0, 10);
  const lastLocalDay = localDate(new Date(new Date(end).getTime() - 1).toISOString());

  const row = await first<Row>(
    `SELECT toi.item_id, toi.item_name, toi.item_description,
            ${PRICE_AS_NUMBER} AS item_price,
            COUNT(DISTINCT toi.order_id) AS total_orders,
            SUM(toi.quantity) AS total_quantity_sold,
            SUM(toi.subtotal) AS total_revenue
     FROM table_order_items toi
     JOIN table_orders o ON o.id = toi.order_id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ? AND o.created_at < ?
     GROUP BY toi.item_id, toi.item_name, toi.item_description, toi.item_price
     ORDER BY total_quantity_sold DESC, total_revenue DESC
     LIMIT 1`,
    restaurantId, start, end
  );
  return row ? [{ ...row, week_start: localDate(start), week_end: lastLocalDay }] : [];
}

// ---------------------------------------------------------------------------
// Estadísticas predictivas (preparación anticipada)
// ---------------------------------------------------------------------------

const ratingFor = (freq: number) =>
  freq >= 0.8 ? "MUY_ALTA" : freq >= 0.6 ? "ALTA" : freq >= 0.4 ? "MEDIA" : freq >= 0.2 ? "BAJA" : "MUY_BAJA";
const priorityFor = (freq: number) => (freq >= 0.8 ? 1 : freq >= 0.6 ? 2 : freq >= 0.4 ? 3 : 4);

/**
 * Platos que se piden con frecuencia y consistencia, con cantidad recomendada
 * (promedio diario + 20 %, redondeado hacia arriba) y franja pico de 2 horas.
 */
export async function predictiveDishes(restaurantId: string, days: number, minFrequency: number): Promise<Row[]> {
  const since = new Date(Date.now() - days * 24 * 3600_000).toISOString();

  const perDay = await all<Row>(
    `SELECT toi.item_id, toi.item_name, toi.item_description,
            ${PRICE_AS_NUMBER} AS item_price,
            date(${LOCAL("o.created_at")}) AS day,
            COUNT(DISTINCT o.id) AS orders,
            SUM(toi.quantity) AS qty
     FROM table_order_items toi
     JOIN table_orders o ON o.id = toi.order_id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?
     GROUP BY toi.item_id, toi.item_name, toi.item_description, toi.item_price, day`,
    restaurantId, since
  );
  const perHour = await all<Row>(
    `SELECT toi.item_id,
            CAST(strftime('%H', ${LOCAL("o.created_at")}) AS INTEGER) AS hour,
            SUM(toi.quantity) AS qty
     FROM table_order_items toi
     JOIN table_orders o ON o.id = toi.order_id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?
     GROUP BY toi.item_id, hour`,
    restaurantId, since
  );

  const hoursByItem = new Map<string, Map<number, number>>();
  for (const r of perHour) {
    const m = hoursByItem.get(r.item_id as string) ?? new Map<number, number>();
    m.set(r.hour as number, r.qty as number);
    hoursByItem.set(r.item_id as string, m);
  }

  const byItem = new Map<string, { base: Row; days: number; orders: number; qty: number }>();
  for (const r of perDay) {
    const key = r.item_id as string;
    const cur = byItem.get(key) ?? { base: r, days: 0, orders: 0, qty: 0 };
    cur.days += 1;
    cur.orders += r.orders as number;
    cur.qty += r.qty as number;
    byItem.set(key, cur);
  }

  const result: Row[] = [];
  for (const [itemId, v] of byItem) {
    const frequency = v.days / days;
    if (frequency < minFrequency) continue;
    const avgDaily = v.qty / v.days;

    // Franja de 2 horas consecutivas con más unidades vendidas
    const hours = hoursByItem.get(itemId) ?? new Map<number, number>();
    let bestStart = 12, bestQty = -1;
    for (let h = 0; h < 23; h++) {
      const q = (hours.get(h) ?? 0) + (hours.get(h + 1) ?? 0);
      if (q > bestQty) { bestQty = q; bestStart = h; }
    }

    result.push({
      item_id: itemId,
      item_name: v.base.item_name,
      item_description: v.base.item_description,
      item_price: v.base.item_price,
      total_orders: v.orders,
      days_ordered: v.days,
      frequency_score: Math.round(frequency * 100) / 100,
      avg_daily_quantity: Math.round(avgDaily * 10) / 10,
      recommended_prep_quantity: Math.ceil(avgDaily * 1.2),
      peak_hour_start: bestStart,
      peak_hour_end: bestStart + 2,
      consistency_rating: ratingFor(frequency),
      preparation_priority: priorityFor(frequency),
    });
  }
  return result.sort((a, b) => (a.preparation_priority as number) - (b.preparation_priority as number)
    || (b.frequency_score as number) - (a.frequency_score as number));
}

/** Pedidos agrupados por hora del día, con el plato más pedido de cada hora. */
export async function hourlyPatterns(restaurantId: string, filter: TimeFilter): Promise<Row[]> {
  const since = periodStart(filter);
  const hourly = await all<Row>(
    `SELECT CAST(strftime('%H', ${LOCAL("o.created_at")}) AS INTEGER) AS hour_of_day,
            COUNT(DISTINCT o.id) AS total_orders,
            SUM(toi.quantity) AS total_items_sold,
            SUM(toi.subtotal) AS revenue
     FROM table_orders o
     JOIN table_order_items toi ON toi.order_id = o.id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?
     GROUP BY hour_of_day ORDER BY hour_of_day`,
    restaurantId, since
  );
  const tops = await all<Row>(
    `SELECT CAST(strftime('%H', ${LOCAL("o.created_at")}) AS INTEGER) AS hour_of_day,
            toi.item_name, SUM(toi.quantity) AS qty
     FROM table_orders o
     JOIN table_order_items toi ON toi.order_id = o.id
     WHERE o.restaurant_id = ? AND o.status != 'cancelled' AND o.created_at >= ?
     GROUP BY hour_of_day, toi.item_name`,
    restaurantId, since
  );
  const best = new Map<number, Row>();
  for (const t of tops) {
    const cur = best.get(t.hour_of_day as number);
    if (!cur || (t.qty as number) > (cur.qty as number)) best.set(t.hour_of_day as number, t);
  }
  return hourly.map((h) => {
    const top = best.get(h.hour_of_day as number);
    const orders = h.total_orders as number;
    return {
      hour_of_day: h.hour_of_day,
      total_orders: orders,
      total_items_sold: h.total_items_sold,
      top_item_name: top ? top.item_name : "N/A",
      top_item_quantity: top ? top.qty : 0,
      avg_order_value: orders > 0 ? Math.round(((h.revenue as number) / orders) * 100) / 100 : 0,
    };
  });
}
