import { all, first } from "@/lib/db";
import { periodStart, weekWinner } from "@/lib/stats";
import { publishWeeklyWinner } from "@/lib/weekly";

export interface CronResult {
  slug: string;
  status: "published" | "already-published" | "no-sales" | "error";
  winner?: string;
  error?: string;
}

/**
 * Publica el plato ganador de la SEMANA ANTERIOR (lunes a domingo) para cada
 * restaurante activo. Un fallo en un restaurante no impide procesar a los demás.
 * Lo ejecuta el cron de Cloudflare (lunes) y el endpoint /api/cron/publish-weekly-winner.
 */
export async function publishWeeklyWinners(now = new Date()) {
  const thisMonday = periodStart("week", now);
  const lastMonday = new Date(new Date(thisMonday).getTime() - 7 * 24 * 3600_000).toISOString();
  // Fechas locales (UTC-5) para etiquetar la semana
  const label = (iso: string, plusDays = 0) =>
    new Date(new Date(iso).getTime() - 5 * 3600_000 + plusDays * 24 * 3600_000).toISOString().slice(0, 10);
  const weekStart = label(lastMonday);
  const weekEnd = label(lastMonday, 6);

  const restaurants = await all<{ id: string; slug: string }>(
    "SELECT id, slug FROM restaurants WHERE status IN ('trial', 'active', 'past_due')"
  );

  const results: CronResult[] = [];
  for (const restaurant of restaurants) {
    try {
      const [winner] = await weekWinner(restaurant.id, lastMonday, thisMonday);
      if (!winner) {
        results.push({ slug: restaurant.slug, status: "no-sales" });
        continue;
      }

      const existing = await first(
        "SELECT id FROM weekly_featured_dishes WHERE restaurant_id = ? AND week_start_date = ? AND item_id = ?",
        restaurant.id, weekStart, winner.item_id as string
      );
      if (existing) {
        results.push({ slug: restaurant.slug, status: "already-published", winner: winner.item_name as string });
        continue;
      }

      await publishWeeklyWinner(restaurant.id, {
        item_id: winner.item_id as string,
        item_name: winner.item_name as string,
        item_description: (winner.item_description as string) || "",
        item_price: winner.item_price as number,
        total_orders: winner.total_orders as number,
        total_quantity_sold: winner.total_quantity_sold as number,
        total_revenue: winner.total_revenue as number,
        week_start_date: weekStart,
        week_end_date: weekEnd,
        published_by: "cron-auto",
      });
      results.push({ slug: restaurant.slug, status: "published", winner: winner.item_name as string });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Cron] Error for ${restaurant.slug}:`, message);
      results.push({ slug: restaurant.slug, status: "error", error: message });
    }
  }
  return { weekStart, weekEnd, results };
}
