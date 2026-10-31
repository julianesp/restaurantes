// Entrada del Worker: delega las peticiones HTTP en vinext y añade el cron semanal.
import handler from "vinext/server/fetch-handler";
import { publishWeeklyWinners } from "../lib/cron";
import { sendBillingReminders } from "../lib/whatsapp";
import { purgeRateLimits, purgeWaiterSessions } from "../lib/cleanup";

// Mantener en sincronía con cloudflare.config.ts y deploy/wrangler.jsonc
const WEEKLY_CRON = "0 5 * * 1";

export default {
  fetch: handler.fetch.bind(handler),

  // Cron Triggers: lunes 05:00 UTC publica el plato ganador de la semana anterior;
  // cada día 14:00 UTC (9:00 en Colombia) envía los recordatorios de pago por WhatsApp
  // y borra los contadores vencidos de rate_limits y las sesiones de meseros vencidas
  async scheduled(event: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    if (event.cron === WEEKLY_CRON) {
      ctx.waitUntil(
        publishWeeklyWinners().then(({ results }) => console.log("[Cron] weekly winners:", JSON.stringify(results)))
      );
      return;
    }
    ctx.waitUntil(
      sendBillingReminders().then((results) => console.log("[Cron] billing reminders:", JSON.stringify(results)))
    );
    ctx.waitUntil(
      purgeRateLimits().then((deleted) => console.log("[Cron] rate limits purged:", deleted))
    );
    ctx.waitUntil(
      purgeWaiterSessions().then((deleted) => console.log("[Cron] waiter sessions purged:", deleted))
    );
  },
};
