import { all, first, batch, newId, nowIso, type Row } from "@/lib/db";
import { weekWinner } from "@/lib/stats";

export const currentFeaturedDish = (restaurantId: string) =>
  first<Row>(
    "SELECT * FROM weekly_featured_dishes WHERE restaurant_id = ? AND is_active = 1 ORDER BY published_at DESC LIMIT 1",
    restaurantId
  );

export const featuredDishesHistory = (restaurantId: string, limit: number, onlyActive: boolean) =>
  all<Row>(
    `SELECT * FROM weekly_featured_dishes WHERE restaurant_id = ? ${onlyActive ? "AND is_active = 1" : ""}
     ORDER BY week_start_date DESC, published_at DESC LIMIT ?`,
    restaurantId,
    limit
  );

export const currentWeekWinner = (restaurantId: string) => weekWinner(restaurantId);

export interface WinnerInput {
  item_id: string;
  item_name: string;
  item_description?: string;
  item_price: number;
  item_image?: string | null;
  total_orders: number;
  total_quantity_sold: number;
  total_revenue: number;
  week_start_date: string;
  week_end_date: string;
  published_by?: string | null;
}

/** Publica el plato ganador de la semana (desactiva el anterior de esa semana y suma victorias). */
export async function publishWeeklyWinner(restaurantId: string, w: WinnerInput): Promise<string> {
  const previous = await first<{ n: number }>(
    "SELECT COUNT(*) AS n FROM weekly_featured_dishes WHERE restaurant_id = ? AND item_id = ?",
    restaurantId,
    w.item_id
  );
  const id = newId();
  const now = nowIso();

  await batch([
    {
      sql: "UPDATE weekly_featured_dishes SET is_active = 0, updated_at = ? WHERE restaurant_id = ? AND week_start_date = ? AND is_active = 1",
      params: [now, restaurantId, w.week_start_date],
    },
    {
      sql: `INSERT INTO weekly_featured_dishes
              (id, restaurant_id, item_id, item_name, item_description, item_price, item_image,
               week_start_date, week_end_date, total_orders, total_quantity_sold, total_revenue,
               published_by, win_count, is_active, published_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      params: [
        id, restaurantId, w.item_id, w.item_name, w.item_description ?? "", w.item_price, w.item_image ?? null,
        w.week_start_date, w.week_end_date, w.total_orders, w.total_quantity_sold, w.total_revenue,
        w.published_by ?? null, (previous?.n ?? 0) + 1, now, now, now,
      ],
    },
  ]);
  return id;
}
